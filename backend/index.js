// =======================
// BACKEND: AskMe API
// Tech: Node.js + Express
// Purpose: Provide routes (URLs) for the frontend
// =======================

// 1) Load libraries we use
const express = require('express');  // Express = small web server
const cors = require('cors');        // CORS = allows frontend (5173) to call backend (5000)

// 2) Create the app and set the port
const app = express();
const PORT = 5000;

// 3) Middlewares (helpers that run before routes)
//    - cors(): allow cross-origin requests (frontend → backend)
//    - express.json(): read JSON body from requests
app.use(cors());
app.use(express.json());

// =======================
// 4) DATA (in memory, no database)
//    These arrays live only while the server is running.
//    They reset when the server restarts. This is OK for your assignment.
// =======================

// QUESTIONS ARRAY (start with two examples)
// Each question has: id, title, description, category, tags[], author, views, createdAt
let questions = [
  {
    id: 1,
    title: "How to install Node.js?",
    description: "I am new to JavaScript. Can someone explain how to install Node.js?",
    category: "Technology",
    tags: ["nodejs", "javascript"],
    author: "Alice",
    views: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "What is React?",
    description: "Can someone explain React in simple words?",
    category: "Web Development",
    tags: ["react", "frontend"],
    author: "Bob",
    views: 5,
    createdAt: new Date().toISOString()
  }
];

// ANSWERS ARRAY (empty to start)
// Each answer belongs to a question, linked by questionId
// Each answer has: id, questionId, author, email(optional), text, createdAt
let answers = [
  // Example shape:
  // { id: 1, questionId: 1, author: "Eve", email: "eve@example.com", text: "Install from nodejs.org", createdAt: "2025-08-31T12:00:00Z" }
];

// =======================
// 5) ROUTES (URLs the frontend will call)
// =======================

// ROOT route (quick check route)
// Visit http://localhost:5000/ to see this text
app.get('/', (req, res) => {
  res.send('Welcome to AskMe API');
});

// Get ALL questions
// Purpose: Frontend shows a list of all questions
// URL: GET /api/questions
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

// Get ONE question by id AND increase its views by 1
// Purpose: When user opens a question, count the visit
// URL: GET /api/questions/:id   e.g., /api/questions/2
app.get('/api/questions/:id', (req, res) => {
  const id = Number(req.params.id);
  const q = questions.find(q => q.id === id);

  if (!q) {
    return res.status(404).json({ error: 'Question not found' });
  }

  q.views += 1; // increase visit counter
  res.json(q);
});

// Create (POST) a NEW question
// Purpose: Form in the frontend sends a new question here
// URL: POST /api/questions
// Body example:
// { "title":"...", "description":"...", "category":"Technology", "tags":"react, javascript", "author":"Jasemina" }
app.post('/api/questions', (req, res) => {
  let { title, description, category, tags, author } = req.body;

  // Very simple validation
  if (!title || !description || !category || !author) {
    return res.status(400).json({ error: 'Please fill: title, description, category, author.' });
  }

  // Convert tags: "react, javascript"  ->  ["react", "javascript"]
  if (typeof tags === 'string') {
    tags = tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  if (!Array.isArray(tags)) tags = [];

  const newQuestion = {
    id: questions.length ? Math.max(...questions.map(q => q.id)) + 1 : 1,
    title,
    description,
    category,
    tags,
    author,
    views: 0, // new question starts with 0 views
    createdAt: new Date().toISOString()
  };

  questions.push(newQuestion); // save in memory
  res.status(201).json(newQuestion);
});

// Get ALL answers for ONE question
// Purpose: Show answers under the question details
// URL: GET /api/questions/:id/answers
app.get('/api/questions/:id/answers', (req, res) => {
  const qid = Number(req.params.id);
  const list = answers.filter(a => a.questionId === qid);
  res.json(list);
});

// Create (POST) a NEW answer for ONE question
// Purpose: Form in the frontend sends a new answer here
// URL: POST /api/questions/:id/answers
// Body example:
// { "author":"Ernesa", "email":"", "text":"Here is how you do it..." }
app.post('/api/questions/:id/answers', (req, res) => {
  const qid = Number(req.params.id);
  const { author, email, text } = req.body;

  // Validate fields (very simple)
  if (!author || !text) {
    return res.status(400).json({ error: 'Please provide your name and answer text.' });
  }

  // Make sure the question exists before adding an answer to it
  const exists = questions.some(q => q.id === qid);
  if (!exists) {
    return res.status(404).json({ error: 'Question not found.' });
  }

  const newAnswer = {
    id: answers.length ? Math.max(...answers.map(a => a.id)) + 1 : 1,
    questionId: qid,
    author,
    email: email || '',
    text,
    createdAt: new Date().toISOString()
  };

  answers.push(newAnswer); // save in memory
  res.status(201).json(newAnswer);
});

// =======================
// 6) START the server
// =======================
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
