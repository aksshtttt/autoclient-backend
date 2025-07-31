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
// 3. Add a new Lead
app.post('/api/leads', async (req, res) => {
  // Get the user's token from the request
  const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
  const { data: { user } } = await supabase.auth.getUser(token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized user' });
  }

  // Get lead details from the request body
  const { clientName, contactInfo, status } = req.body;

  if (!clientName || !status) {
    return res.status(400).json({ error: 'Client name and status are required.' });
  }

  // Add the new lead to the database, linked to the logged-in user
  const { data: newLead, error } = await supabase
    .from('leads')
    .insert([
      { 
        clientName: clientName, 
        contactInfo: contactInfo, 
        status: status, 
        userId: user.id  // Linking the lead to the user
      }
    ])
    .select();

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: 'Lead added successfully!', lead: newLead });
});

// --- Start Server ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
