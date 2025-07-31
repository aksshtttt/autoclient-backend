require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- API Endpoints ---

// 1. Root Endpoint (to check if server is running)
app.get('/', (req, res) => {
  res.send('Autoclient OS Backend is running!');
});

// 2. Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.status(200).json({ message: 'Login successful!', user: data.user, session: data.session });
});


// --- Start Server ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
