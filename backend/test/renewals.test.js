import { beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NOW, addMembership, addSubscription, deliver, fakeRes, invoiceFor, iso, payments, reset, state,
} from './helpers.js';

const YEAR = 365 * 24 * 3600;
const MONTH = 30 * 24 * 3600;
const membership = () => state.tables.memberships[0];

beforeEach(reset);

describe('donations never change a membership', () => {
  test('donation update keeps the membership expiry', async () => {
    addMembership();
    const expiry = membership().expires_at;
    const sub = addSubscription('sub_donation', { donation: true, periodEnd: NOW + MONTH });
    await deliver('customer.subscription.updated', sub);
    assert.equal(membership().expires_at, expiry);
  });

  test('canceling a donation keeps the membership active', async () => {
    addMembership();
    const sub = addSubscription('sub_donation', { donation: true, status: 'canceled' });
    await deliver('customer.subscription.deleted', sub);
    assert.equal(membership().status, 'active');
  });

  test('a scheduled donation cancellation keeps the membership active', async () => {
    addMembership();
    const sub = addSubscription('sub_donation', { donation: true });
    sub.cancel_at_period_end = true;
    await deliver('customer.subscription.updated', sub);
    assert.equal(membership().status, 'active');
  });

  test('a failed donation charge keeps the membership active', async () => {
    addMembership();
    const expiry = membership().expires_at;
    addSubscription('sub_donation', { donation: true, status: 'past_due' });
    await deliver('invoice.payment_failed', invoiceFor('sub_donation'));
    assert.equal(membership().status, 'active');
    assert.equal(membership().expires_at, expiry);
  });

  test('starting a monthly donation keeps an existing membership unchanged', async () => {
    addMembership();
    const before = { ...membership() };
    addSubscription('sub_donation', { donation: true, periodEnd: NOW + MONTH });
    await deliver('checkout.session.completed', {
      id: 'cs_1', mode: 'subscription', client_reference_id: 'user-1', customer: 'cus_1',
      subscription: 'sub_donation', amount_total: 500, metadata: { donation_type: 'monthly' },
    });
    assert.deepEqual(membership(), before);
  });

  test('a donor with no membership is not counted as an active member', async () => {
    addSubscription('sub_donation', { donation: true, periodEnd: NOW + MONTH });
    await deliver('checkout.session.completed', {
      id: 'cs_1', mode: 'subscription', client_reference_id: 'user-1', customer: 'cus_1',
      subscription: 'sub_donation', amount_total: 500, metadata: { donation_type: 'monthly' },
    });
    assert.equal(membership().status, 'donor');
    assert.equal(membership().expires_at, null);
    assert.equal(membership().stripe_customer_id, 'cus_1');
  });

  test('joining after donating activates the same record', async () => {
    addMembership({ status: 'donor', expires_at: null });
    addSubscription('sub_member', { periodEnd: NOW + YEAR });
    await deliver('checkout.session.completed', {
      id: 'cs_2', mode: 'subscription', client_reference_id: 'user-1', customer: 'cus_1',
      subscription: 'sub_member', amount_total: 10000, metadata: {},
    });
    assert.equal(state.tables.memberships.length, 1);
    assert.equal(membership().status, 'active');
    assert.equal(membership().expires_at, iso(NOW + YEAR));
  });

  test('a first monthly donation sends exactly one thank-you email', async () => {
    addMembership();
    addSubscription('sub_donation', { donation: true, periodEnd: NOW + MONTH });
    await deliver('checkout.session.completed', {
      id: 'cs_1', mode: 'subscription', client_reference_id: 'user-1', customer: 'cus_1',
      subscription: 'sub_donation', amount_total: 500, metadata: { donation_type: 'monthly' },
    });
    await deliver('invoice.payment_succeeded', invoiceFor('sub_donation', { billing_reason: 'subscription_create', amount_paid: 500 }));
    assert.equal(state.tables.payments.length, 1);
    assert.equal(state.emails.length, 1);
    assert.match(state.emails[0].subject, /Donation/);
    assert.ok(!state.emails[0].html.includes('membership is now active'));
  });

  test('a monthly donation renewal sends a donation email', async () => {
    addMembership();
    addSubscription('sub_donation', { donation: true });
    await deliver('invoice.payment_succeeded', invoiceFor('sub_donation'));
    assert.equal(state.emails.length, 1);
    assert.match(state.emails[0].subject, /Donation/);
  });
});

describe('membership renewals', () => {
  test('a yearly renewal records one payment and sends one email with the new expiry', async () => {
    addMembership();
    const newEnd = NOW + 2 * YEAR;
    addSubscription('sub_member', { periodEnd: newEnd });
    await deliver('invoice.payment_succeeded', invoiceFor('sub_member'));
    assert.equal(state.tables.payments.length, 1);
    assert.equal(state.emails.length, 1);
    assert.match(state.emails[0].subject, /Renewed/);
    assert.ok(state.emails[0].html.includes(new Date(iso(newEnd)).toLocaleDateString()));
  });

  test('a renewal update moves the expiry forward', async () => {
    addMembership();
    const newEnd = NOW + 2 * YEAR;
    const sub = addSubscription('sub_member', { periodEnd: newEnd });
    await deliver('customer.subscription.updated', sub);
    assert.equal(membership().expires_at, iso(newEnd));
    assert.equal(membership().status, 'active');
  });

  test('a plan-change invoice does not send a renewal email', async () => {
    addMembership();
    addSubscription('sub_member');
    await deliver('invoice.payment_succeeded', invoiceFor('sub_member', { billing_reason: 'subscription_update' }));
    assert.equal(state.tables.payments.length, 1);
    assert.equal(state.emails.length, 0);
  });

  test('a first invoice records the payment without a renewal email', async () => {
    addMembership();
    addSubscription('sub_member');
    await deliver('invoice.payment_succeeded', invoiceFor('sub_member', { billing_reason: 'subscription_create' }));
    assert.equal(state.tables.payments.length, 1);
    assert.equal(state.emails.length, 0);
  });

  test('a repeated renewal event is ignored', async () => {
    addMembership();
    addSubscription('sub_member');
    const invoice = invoiceFor('sub_member');
    await deliver('invoice.payment_succeeded', invoice);
    await deliver('invoice.payment_succeeded', invoice);
    assert.equal(state.tables.payments.length, 1);
    assert.equal(state.emails.length, 1);
  });

  test('canceling the membership subscription marks it canceled', async () => {
    addMembership();
    const sub = addSubscription('sub_member', { status: 'canceled' });
    await deliver('customer.subscription.deleted', sub);
    assert.equal(membership().status, 'canceled');
  });
});

describe('failed renewals', () => {
  test('a failed charge marks past_due and keeps the expiry date', async () => {
    addMembership();
    const expiry = membership().expires_at;
    addSubscription('sub_member', { status: 'past_due' });
    await deliver('invoice.payment_failed', invoiceFor('sub_member'));
    assert.equal(membership().status, 'past_due');
    assert.equal(membership().expires_at, expiry);
  });

  test('a late failure event cannot downgrade a recovered subscription', async () => {
    addMembership();
    addSubscription('sub_member', { status: 'active' });
    await deliver('invoice.payment_failed', invoiceFor('sub_member'));
    assert.equal(membership().status, 'active');
  });

  test('a recovered card returns the member to active', async () => {
    addMembership({ status: 'past_due' });
    const sub = addSubscription('sub_member', { status: 'active', periodEnd: NOW + 2 * YEAR });
    await deliver('customer.subscription.updated', sub);
    assert.equal(membership().status, 'active');
    assert.equal(membership().expires_at, iso(NOW + 2 * YEAR));
  });
});

describe('checkout cannot create a second membership', () => {
  const checkout = async () => {
    const res = fakeRes();
    await payments.createCheckoutSession({ body: { priceId: 'price_membership' }, user: { id: 'user-1' } }, res);
    return res;
  };

  test('a past_due member is sent to billing instead of paying again', async () => {
    addMembership({ status: 'past_due' });
    addSubscription('sub_member', { status: 'past_due' });
    const res = await checkout();
    assert.equal(res.statusCode, 409);
    assert.equal(state.sessions.length, 0);
  });

  test('an active donation does not block joining and reuses the customer', async () => {
    addMembership({ status: 'donor', expires_at: null });
    addSubscription('sub_donation', { donation: true });
    const res = await checkout();
    assert.equal(res.statusCode, 200);
    assert.equal(state.sessions[0].customer, 'cus_1');
  });

  test('a former member can rejoin on their existing customer', async () => {
    addMembership({ status: 'canceled', expires_at: null });
    addSubscription('sub_old', { status: 'canceled' });
    const res = await checkout();
    assert.equal(res.statusCode, 200);
    assert.equal(state.sessions[0].customer, 'cus_1');
  });
});

describe('failed processing is retried by Stripe', () => {
  test('a database failure returns 500', async () => {
    addMembership();
    const sub = addSubscription('sub_member', { periodEnd: NOW + 2 * YEAR });
    state.failures.push({ table: 'memberships', op: 'update' });
    const res = await deliver('customer.subscription.updated', sub);
    assert.equal(res.statusCode, 500);
  });

  test('a retry after failure completes with one payment and one email', async () => {
    addMembership();
    addSubscription('sub_member');
    const invoice = invoiceFor('sub_member');
    state.failures.push({ table: 'payments', op: 'insert' });
    const first = await deliver('invoice.payment_succeeded', invoice);
    assert.equal(first.statusCode, 500);
    assert.equal(state.emails.length, 0);
    const second = await deliver('invoice.payment_succeeded', invoice);
    assert.equal(second.statusCode, 200);
    assert.equal(state.tables.payments.length, 1);
    assert.equal(state.emails.length, 1);
  });

  test('a repeated one-time donation event records one payment', async () => {
    const session = {
      id: 'cs_3', mode: 'payment', client_reference_id: 'user-1', customer: null,
      payment_intent: 'pi_1', amount_total: 2500, metadata: { donation_type: 'one-time' },
    };
    await deliver('checkout.session.completed', session);
    await deliver('checkout.session.completed', session);
    assert.equal(state.tables.payments.length, 1);
    assert.equal(state.emails.length, 1);
  });

  test('a bad signature is rejected', async () => {
    const { handleStripeWebhook } = await import('../src/api/v1/controllers/webhooks.controller.js');
    const res = fakeRes();
    await handleStripeWebhook({ headers: { 'stripe-signature': 't=1,v1=bad' }, body: Buffer.from('{}') }, res);
    assert.equal(res.statusCode, 400);
  });
});
