// ===============================
// USERS MICROSERVICE (port 5001)
// Tech: Node.js + Express
// Purpose: simple registration (name + email), kept in memory
// ===============================

const express = require('express');  // small web server
const cors = require('cors');        // allow calls from frontend (5173) and other services

const app = express();
const PORT = 5001;

// Middlewares: allow JSON + cross-origin
app.use(cors());
app.use(express.json());

// ===============================
// DATA (in memory only)
// When server restarts -> data resets (OK for assignment)
// ===============================

// USERS ARRAY
// Each user: { id, name, email, createdAt }
let users = [
  // example:
  // { id: 1, name: "Alice", email: "alice@example.com", createdAt: "2025-08-31T12:00:00Z" }
];

// ===============================
// ROUTES
// ===============================

// Quick check
// GET http://localhost:5001/
app.get('/', (req, res) => {
  res.send('Users service is running');
});

// List all users (for demo)
// GET http://localhost:5001/api/users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Register a new user (simple)
// POST http://localhost:5001/api/users/register
// Body example: { "name":"Jasemina", "email":"jasemina@example.com" }
app.post('/api/users/register', (req, res) => {
  const { name, email } = req.body;

  // very simple validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Please fill name and email.' });
  }

  // super simple email format check (not perfect, just enough)
  const looksLikeEmail = /\S+@\S+\.\S+/.test(email);
  if (!looksLikeEmail) {
    return res.status(400).json({ error: 'Please enter a valid email (e.g. user@example.com).' });
  }

  // (optional) avoid duplicate email
  const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return res.status(409).json({ error: 'This email is already registered.' });
  }

  const newUser = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  return res.status(201).json(newUser);
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Users service running on http://localhost:${PORT}`);
});
