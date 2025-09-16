
const express = require('express');  // small web server
const cors = require('cors');        // CORS = allows frontend (5173) to call backend (4000)

//  Create the app and set the port
const app = express();
const PORT = 4000;
//helpers
app.use(cors());
app.use(express.json());

//static questions i have created

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

let answers = [];


// Checks if server is alive
app.get('/', (req, res) => {  res.send('The server for questions and answers is running');});

// Get ALL questions
app.get('/api/questions', (req, res) => {  res.json(questions);});

// Get ONE question by id AND increase its views by 1
app.get('/api/questions/:id', (req, res) => {
  const id = Number(req.params.id);
  const q = questions.find(q => q.id === id);

  if (!q) {
    return res.status(404).json({ error: 'Question not found' });
  }

  q.views += 1; 
  res.json(q);
});

// Create a NEW question
app.post('/api/questions', (req, res) => {
  let { title, description, category, tags, author } = req.body;

  
  if (!title || !description || !category || !author) {
    return res.status(400).json({ error: 'Please fill: title, description, category, author.' });
  }

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

  questions.push(newQuestion);
  res.status(201).json(newQuestion);
});

// Get ALL answers for ONE question
app.get('/api/questions/:id/answers', (req, res) => {
  const qid = Number(req.params.id);
  const list = answers.filter(a => a.questionId === qid);
  res.json(list);
});

app.post('/api/questions/:id/answers', (req, res) => {
  const qid = Number(req.params.id);
  const { author, email, text } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'Please provide your name and answer text.' });
  }

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


//start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
