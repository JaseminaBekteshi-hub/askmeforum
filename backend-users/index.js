// backend-users/index.js
// Users microservice (port 5001)
// - Registers forum users (name + email)
// - Persists users to users.json
// - Login by email (simple lookup; no password for class demo)
// - GET /api/users to let Forum service validate authors

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveUsers(list) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2));
}

let users = loadUsers();

// Health
app.get('/', (_req, res) => res.send('Users service is running (5001)'));

// Register
app.post('/api/users/register', (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });

  const exists = users.some(u => String(u.email).toLowerCase() === String(email).toLowerCase());
  if (exists) return res.status(400).json({ error: 'A user with this email already exists.' });

  const newUser = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name: String(name).trim(),
    email: String(email).trim(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  res.json(newUser);
});

// Simple login (by email)
app.post('/api/users/login', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const user = users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(404).json({ error: 'No user found with this email. Please register.' });

  res.json({ id: user.id, name: user.name, email: user.email });
});

// List users (for forum service validation)
app.get('/api/users', (_req, res) => res.json(users));

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Users service listening on http://localhost:${PORT}`);
});
