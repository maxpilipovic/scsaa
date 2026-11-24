// Test harness: real webhook signatures and controllers, with an in-memory
// database and captured email so tests never touch Supabase or SendGrid.
import { mock } from 'node:test';
import RealStripe from 'stripe';

Object.assign(process.env, {
  STRIPE_SECRET_KEY: 'sk_test_harness',
  STRIPE_WEBHOOK_SECRET: 'whsec_harness',
  RECURRING_PRICE_ID: 'price_membership',
  ONETIME_PRICE_ID: 'price_once',
  SENDGRID_API_KEY: 'SG.harness',
  SENDGRID_FROM_EMAIL: 'test@example.org',
  FRONTEND_URL: 'https://site.example',
  SUPABASE_URL: 'http://127.0.0.1:9',
  SUPABASE_SERVICE_ROLE_KEY: 'harness',
});

export const state = { tables: {}, failures: [], emails: [], subscriptions: {}, sessions: [] };

export const reset = () => {
  state.tables = {
    users: [{ id: 'user-1', email: 'member@example.org', first_name: 'Test', last_name: 'Member' }],
    memberships: [],
    payments: [],
    audit_logs: [],
  };
  state.failures = [];
  state.emails = [];
  state.subscriptions = {};
  state.sessions = [];
};

class Query {
  constructor(table) {
    this.table = table;
    this.op = 'select';
    this.filters = [];
    this.payload = null;
    this.mode = 'many';
    this.conflict = null;
  }
  select() { return this; }
  eq(column, value) { this.filters.push([column, value]); return this; }
  in(column, values) { this.filters.push([column, values]); return this; }
  order() { return this; }
  limit() { return this; }
  insert(payload) { this.op = 'insert'; this.payload = payload; return this; }
  update(payload) { this.op = 'update'; this.payload = payload; return this; }
  upsert(payload, options) { this.op = 'upsert'; this.payload = payload; this.conflict = options?.onConflict; return this; }
  single() { this.mode = 'single'; return this; }
  maybeSingle() { this.mode = 'maybe'; return this; }

  run() {
    const index = state.failures.findIndex((f) => f.table === this.table && f.op === this.op);
    if (index >= 0) {
      state.failures.splice(index, 1);
      return { data: null, error: { message: 'simulated database outage' } };
    }
    const rows = (state.tables[this.table] ??= []);
    const matches = (row) => this.filters.every(([c, v]) => (Array.isArray(v) ? v.includes(row[c]) : row[c] === v));
    if (this.op === 'insert') {
      rows.push(...[].concat(this.payload).map((r) => ({ ...r })));
      return { data: null, error: null };
    }
    if (this.op === 'update') {
      rows.filter(matches).forEach((row) => Object.assign(row, this.payload));
      return { data: null, error: null };
    }
    if (this.op === 'upsert') {
      const existing = rows.find((row) => row[this.conflict] === this.payload[this.conflict]);
      if (existing) Object.assign(existing, this.payload);
      else rows.push({ ...this.payload });
      return { data: null, error: null };
    }
    const found = rows.filter(matches).map((row) => ({ ...row }));
    if (this.mode === 'many') return { data: found, error: null };
    if (found.length === 0) {
      return this.mode === 'maybe'
        ? { data: null, error: null }
        : { data: null, error: { code: 'PGRST116', message: 'no rows' } };
    }
    return { data: found[0], error: null };
  }
  then(resolve, reject) { return Promise.resolve().then(() => this.run()).then(resolve, reject); }
}

mock.module(new URL('../src/config/supabaseClient.js', import.meta.url).href, {
  namedExports: { supabase: { from: (table) => new Query(table) } },
});

mock.module('@sendgrid/mail', {
  defaultExport: {
    setApiKey() {},
    send: async (message) => { state.emails.push(message); },
  },
});

const signer = new RealStripe('sk_test_harness');

class FakeStripe extends RealStripe {
  constructor(key) {
    super(key);
    this.subscriptions = {
      retrieve: async (id) => state.subscriptions[id],
      list: async ({ customer }) => ({
        data: Object.values(state.subscriptions).filter((s) => s.customer === customer),
      }),
    };
    this.checkout = {
      sessions: {
        create: async (config) => {
          state.sessions.push(config);
          return { id: `cs_${state.sessions.length}`, url: 'https://checkout.example', ...config };
        },
      },
    };
  }
}

mock.module('stripe', { defaultExport: FakeStripe });

const { handleStripeWebhook } = await import('../src/api/v1/controllers/webhooks.controller.js');
export const payments = await import('../src/api/v1/controllers/payments.controller.js');

export const fakeRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { res.statusCode = code; return res; },
    json(body) { res.body = body; return res; },
    send(body) { res.body = body; return res; },
  };
  return res;
};

let eventCounter = 0;
export const deliver = async (type, object, id = `evt_${++eventCounter}`) => {
  const payload = JSON.stringify({ id, object: 'event', type, data: { object } });
  const header = signer.webhooks.generateTestHeaderString({ payload, secret: 'whsec_harness' });
  const res = fakeRes();
  await handleStripeWebhook({ headers: { 'stripe-signature': header }, body: Buffer.from(payload) }, res);
  return res;
};

const YEAR = 365 * 24 * 3600;
export const NOW = Math.floor(Date.UTC(2026, 10, 23) / 1000);
export const iso = (unix) => new Date(unix * 1000).toISOString();

export const addSubscription = (id, { donation = false, status = 'active', periodEnd = NOW + YEAR, customer = 'cus_1' } = {}) => {
  state.subscriptions[id] = {
    id,
    customer,
    status,
    cancel_at: null,
    cancel_at_period_end: false,
    metadata: donation ? { donation_type: 'monthly', user_id: 'user-1' } : { user_id: 'user-1' },
    items: { data: [{ current_period_end: periodEnd }] },
  };
  return state.subscriptions[id];
};

export const addMembership = (overrides = {}) => {
  const row = {
    user_id: 'user-1',
    stripe_customer_id: 'cus_1',
    year: 2026,
    status: 'active',
    paid_at: iso(NOW),
    expires_at: iso(NOW + YEAR),
    ...overrides,
  };
  state.tables.memberships.push(row);
  return row;
};

export const invoiceFor = (subscriptionId, overrides = {}) => ({
  id: `in_${subscriptionId}_${overrides.billing_reason ?? 'subscription_cycle'}`,
  customer: state.subscriptions[subscriptionId].customer,
  amount_paid: 10000,
  amount_due: 10000,
  billing_reason: 'subscription_cycle',
  parent: { subscription_details: { subscription: subscriptionId } },
  ...overrides,
});
