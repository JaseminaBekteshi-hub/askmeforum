
const express = require('express');//web server library
const cors = require('cors'); //
const fs = require('fs');
const path = require('path');

//create app
const app = express();
app.use(cors());
app.use(express.json());

//create file for storing users
const USERS_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }//read json file
}
function saveUsers(list) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2));
}

let users = loadUsers();

// Checks if server is alive
app.get('/', (_req, res) => res.send('Users service is running (5001)'));

// Register new user
app.post('/api/users/register', (req, res) => {
  const { name, surname, email } = req.body || {};
  if (!name || !email || !surname) return res.status(400).json({ error: 'Name and email are required.' });

  const exists = users.some(u => String(u.email).toLowerCase() === String(email).toLowerCase());
  if (exists) return res.status(400).json({ error: 'A user with this email already exists.' });

  const newUser = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name: String(name).trim(),
    surname: String(surname).trim(),
    email: String(email).trim(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  res.json(newUser);
});

// Login user
app.post('/api/users/login', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const user = users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(404).json({ error: 'No user found with this email. Please register.' });

  res.json({ id: user.id, name: user.name, surname:user.surname, email: user.email });
});

// Return all users
app.get('/api/users', (_req, res) => res.json(users));

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Users service listening on http://localhost:${PORT}`);
});
