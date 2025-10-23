import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import Stripe from 'stripe';
import e from 'express';



const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);



const app = express();
const PORT = process.env.PORT || 3001;

//Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(morgan('combined'));
app.use(express.json());

//Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SCSAA Backend is running',
    version: '1.0.0',
    status: 'running'
  });
});

//Check access API route
app.get('/api/check-access', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ authorized : false });
  }

  //Check if user exists in your database...
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('first_name, last_name, pledge_class, is_admin, phone_number, address, dob')
    .eq('email', user.email)
    .single();

  if (usersError || !users) {
    return res.status(403).json({ authorized: false });
  }

  return res.json({ 
    authorized: true, 
    authUser: {
      first_name: users.first_name,
      last_name: users.last_name,
      pledge_class: users.pledge_class,
      is_admin: users.is_admin,
      phone_number: users.phone_number,
      address: users.address,
      dob: users.dob,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});