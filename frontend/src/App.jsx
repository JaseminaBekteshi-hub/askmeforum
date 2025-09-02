// =====================================
// AskMe Frontend (hard-centered version)
// =====================================

import { useEffect, useState } from 'react';
import './App.css';

const categoriesForForm = ['Technology', 'Web Development', 'Business', 'General'];
const categoriesForFilter = ['All', ...categoriesForForm];

function App() {
  // ----- state -----
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);

  const [questionForm, setQuestionForm] = useState({
    title: '',
    description: '',
    category: 'Technology',
    tags: '',
    author: ''
  });
  const [answerForm, setAnswerForm] = useState({ author: '', email: '', text: '' });

  const [userForm, setUserForm] = useState({ name: '', email: '' });
  const [userMsg, setUserMsg] = useState('');
  const [message, setMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // ----- load questions -----
  const loadQuestions = () => {
    fetch('http://localhost:5000/api/questions')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(console.error);
  };
  useEffect(() => { loadQuestions(); }, []);

  // ----- handlers -----
  const handleQuestionChange = (e) =>
    setQuestionForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleAnswerChange = (e) =>
    setAnswerForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleUserChange = (e) =>
    setUserForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ====== USERS (5001) ======
  const registerUser = async (e) => {
    e.preventDefault();
    setUserMsg('');
    try {
      const res = await fetch('http://localhost:5001/api/users/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (!res.ok) return setUserMsg(data.error || 'Registration failed');
      setUserMsg(`Registered: ${data.name} (${data.email}) ✅`);
      setUserForm({ name: '', email: '' });
    } catch {
      setUserMsg('Could not reach Users service (5001).');
    }
  };

  // ====== FORUM (5000) ======
  const submitQuestion = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionForm)
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Failed to create question');
      setMessage('Question posted! ✅');
      setQuestionForm({ title: '', description: '', category: 'Technology', tags: '', author: '' });
      loadQuestions();
    } catch {
      setMessage('Could not reach Forum service (5000).');
    }
  };

  const openQuestion = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/questions/${id}`);
      if (!res.ok) return setSelected(null);
      const data = await res.json();
      setSelected(data);
      loadQuestions();
      loadAnswers(id);
      setAnswerForm({ author: '', email: '', text: '' });
    } catch {}
  };

  const loadAnswers = (qid) => {
    fetch(`http://localhost:5000/api/questions/${qid}/answers`)
      .then(res => res.json())
      .then(setAnswers)
      .catch(console.error);
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const res = await fetch(`http://localhost:5000/api/questions/${selected.id}/answers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answerForm)
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Failed to add answer');
      loadAnswers(selected.id);
      setAnswerForm({ author: '', email: '', text: '' });
    } catch {
      alert('Could not reach Forum service (5000).');
    }
  };

  const backToList = () => { setSelected(null); setAnswers([]); };

  const filteredQuestions =
    categoryFilter === 'All' ? questions : questions.filter(q => q.category === categoryFilter);

  // ----- UI -----
  return (
    /* HARD CENTER: full-width flex that centers the inner column */
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      {/* Fixed-width inner column; maxWidth keeps it responsive */}
      <div style={{ width: '720px', maxWidth: '90vw', margin: '40px 0' }}>
        <header className="header">
          <h1>AskMe – Forum</h1>
          <p className="tagline">
            This is a forum for technical questions. Everyone can post a new question and
            also answer questions that are already posted.
          </p>
        </header>

        {/* Register */}
        <section className="card">
          <h2 className="section-title">Please register here</h2>
          <form onSubmit={registerUser}>
            <label className="label">Your name</label>
            <input className="input" name="name" value={userForm.name} onChange={handleUserChange} />

            <div style={{ height: 10 }} />
            <label className="label">Your email</label>
            <input className="input" name="email" value={userForm.email} onChange={handleUserChange} />

            <div style={{ height: 12 }} />
            <button type="submit" className="btn">Register</button>
          </form>
          {userMsg && <p className="small" style={{ marginTop: 10 }}>{userMsg}</p>}
        </section>

        {selected ? (
          /* DETAILS */
          <section className="card">
            <button onClick={backToList} className="btn" style={{ marginBottom: 12 }}>← Back</button>
            <h2 style={{ margin: '6px 0 8px' }}>{selected.title}</h2>
            <p>{selected.description}</p>
            <p className="small">
              Category: {selected.category} | Author: {selected.author} | Views: {selected.views}
              {selected.tags?.length ? <> | Tags: {selected.tags.join(', ')}</> : null}
            </p>

            <hr className="divider" />

            <h3 className="section-title" style={{ marginTop: 0 }}>Answers</h3>
            {answers.length === 0 ? (
              <p className="small">No answers yet. Be the first to answer!</p>
            ) : (
              answers.map(a => (
                <div key={a.id} className="answer">
                  <strong>{a.author}</strong>{a.email ? ` (${a.email})` : ''}: {a.text}
                  <div className="small">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}

            <hr className="divider" />

            <h3 className="section-title">Add your answer</h3>
            <form onSubmit={submitAnswer}>
              <label className="label">Your name</label>
              <input className="input" name="author" value={answerForm.author} onChange={handleAnswerChange} />

              <div style={{ height: 10 }} />
              <label className="label">Your email (optional)</label>
              <input className="input" name="email" value={answerForm.email} onChange={handleAnswerChange} />

              <div style={{ height: 10 }} />
              <label className="label">Your answer</label>
              <textarea className="textarea" name="text" value={answerForm.text} onChange={handleAnswerChange} />

              <div style={{ height: 12 }} />
              <button type="submit" className="btn">Post Answer</button>
            </form>
          </section>
        ) : (
          <>
            {/* Ask a Question */}
            <section className="card">
              <h2 className="section-title">Ask a Question</h2>
              <p className="small" style={{ marginTop: -6 }}>
                Provide a clear title and description. Choose a category and add tags like <em>react</em>, <em>javascript</em>.
              </p>

              <form onSubmit={submitQuestion}>
                <label className="label">Title</label>
                <input className="input" name="title" value={questionForm.title} onChange={handleQuestionChange} />

                <div style={{ height: 10 }} />
                <label className="label">Description</label>
                <textarea className="textarea" name="description" value={questionForm.description} onChange={handleQuestionChange} />

                <div style={{ height: 10 }} />
                <label className="label">Category</label>
                <select className="select" name="category" value={questionForm.category} onChange={handleQuestionChange}>
                  {categoriesForForm.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div style={{ height: 10 }} />
                <label className="label">Tags (comma separated)</label>
                <input className="input" name="tags" value={questionForm.tags} onChange={handleQuestionChange} placeholder="react, javascript" />

                <div style={{ height: 10 }} />
                <label className="label">Your name</label>
                <input className="input" name="author" value={questionForm.author} onChange={handleQuestionChange} />

                <div style={{ height: 12 }} />
                <button type="submit" className="btn">Post Question</button>
              </form>

              {message && <p className="small" style={{ marginTop: 12 }}>{message}</p>}
            </section>

            {/* Filter */}
            <section className="card" style={{ paddingBottom: 10 }}>
              <h2 className="section-title" style={{ marginBottom: 6 }}>All Questions</h2>
              <label className="label">Filter by category</label>
              <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categoriesForFilter.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </section>

            {/* Questions list */}
            <section>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filteredQuestions.map(q => (
                  <li key={q.id} className="q-item" style={{ marginBottom: 14 }}>
                    <h3>{q.title}</h3>
                    <p className="small" style={{ marginTop: -2, marginBottom: 8 }}>{q.description}</p>
                    <div className="q-meta">
                      Category: {q.category} | Author: {q.author} | Views: {q.views}
                      {q.tags?.length ? <> | Tags: {q.tags.join(', ')}</> : null}
                    </div>
                    <div className="q-open">
                      <button className="btn" onClick={() => openQuestion(q.id)}>Open</button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <footer className="footer">
          © 2025 AskMe Forum | Built by Jasemina & Ernesa
        </footer>
      </div>
    </div>
  );
}

export default App;
