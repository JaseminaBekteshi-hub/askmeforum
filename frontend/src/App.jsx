//imports api, categories

import { useEffect, useState } from 'react';
import './App.css';

const askme_API = 'http://localhost:4000';
const USERS_API = 'http://localhost:5001';

const categoriesForForm = ['Technology', 'Web Development', 'Business', 'General','Other'];
const categoriesForFilter = ['All', ...categoriesForForm];

//main function
function App() {
  // =================== USE EFFECT (load data,runs once) ===================
  useEffect(() => {
    
    const saved = localStorage.getItem('logged_user');
    if (saved) {
      const u = JSON.parse(saved);
      setCurrentUser(u);
      setRegisterForm({ name: u.name,surname:u.surname, email: u.email });
      setQuestionForm(p => ({ ...p, author: u.name }));
    }
    
    loadQuestions();
  }, []);


  // =================== USERS: state ===================
  const [currentUser, setCurrentUser] = useState(null);
  const [registerForm, setRegisterForm] = useState({ name: '', surname:'', email: '' });
  const [loginForm, setLoginForm] = useState({ email: '' });
  const [authMsg, setAuthMsg] = useState('');

  // =================== USERS: handlers ===================
  const handleRegisterChange = (e) =>
    setRegisterForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleLoginChange = (e) =>
    setLoginForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // =================== USERS: actions ===================

    const registerUser = async (e) => {
    e.preventDefault();
    setAuthMsg('');
    try {
      const res = await fetch(`${USERS_API}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (!res.ok) return setAuthMsg(data?.error || 'Registration failed');
      localStorage.setItem('logged_user', JSON.stringify({ name: data.name, surname: data.surname, email: data.email }));
      setCurrentUser({ name: data.name, surname: data.surname, email: data.email });
      setQuestionForm(p => ({ ...p, author: data.name }));
      setAuthMsg(`Registered: ${data.name} (${data.email}) ✅`);
    } catch {
      setAuthMsg('Could not reach Users service (5001).');
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setAuthMsg('');
    try {
      const res = await fetch(`${USERS_API}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) return setAuthMsg(data?.error || 'Login failed');
      localStorage.setItem('logged_user', JSON.stringify({ name: data.name, email: data.email, surname: data.surname}));
      setCurrentUser({ name: data.name,surname:data.surname, email: data.email, });
      setQuestionForm(p => ({ ...p, author: data.name }));
      setAuthMsg(`Logged in as: ${data.name} ✅`);
    } catch {
      setAuthMsg('Could not reach Users service (5001).');
    }
  };

  const logout = () => {
    localStorage.removeItem('logged_user');
    setCurrentUser(null);
    setRegisterForm({ name: '', email: '' });
    setLoginForm({ email: '' });
    setQuestionForm(p => ({ ...p, author: '' }));
    setAuthMsg('Logged out.');
  };


  // =================== QUESTIONS: state ===================

  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    title: '',
    description: '',
    category: 'General',
    tags: '',
    author: '', // filled from currentUser
  });
  const [questionMsg, setQuestionMsg] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // =================== QUESTIONS: fetch ===================
  const loadQuestions = async () => {
    try {
      const res = await fetch(`${askme_API}/api/questions`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch {}
  };

  // =================== QUESTIONS: handlers ===================
  const handleQuestionChange = (e) =>
    setQuestionForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // =================== QUESTIONS: actions ===================

  const submitQuestion = async (e) => {
    e.preventDefault();
    setQuestionMsg('');
    if (!currentUser) {
      setQuestionMsg('Please login or register first to add a question.');
      return;
    }
    try {
      const res = await fetch(`${askme_API}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...questionForm,
          author: currentUser.name, 
        }),
      });
      const data = await res.json();
      if (!res.ok) return setQuestionMsg(data?.error || 'Failed to create question');

      setQuestionMsg('Question posted! ✅');
      setQuestionForm({
        title: '',
        description: '',
        category: 'General',
        tags: '',
        author: currentUser.name,
      });
      await loadQuestions();
    } catch {
      setQuestionMsg('Could not reach Forum service (4000).');
    }
  };

  const openQuestion = async (id) => {
    try {
      const res = await fetch(`${askme_API}/api/questions/${id}`);
      if (!res.ok) return;
      const q = await res.json();
      setSelected(q);
      await loadQuestions();    
      await loadAnswers(id);     
      setAnswerForm({ author: '', email: '', text: '' });
    } catch {}
  };


  // =================== ANSWERS: state ===================
  const [answers, setAnswers] = useState([]);
  const [answerForm, setAnswerForm] = useState({ author: '', email: '', text: '' });

  // =================== ANSWERS: fetch ===================
  const loadAnswers = async (qid) => {
    try {
      const res = await fetch(`${askme_API}/api/questions/${qid}/answers`);
      const data = await res.json();
      setAnswers(Array.isArray(data) ? data : []);
    } catch {}
  };

  // =================== ANSWERS: handlers ===================
  const handleAnswerChange = (e) =>
    setAnswerForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // =================== ANSWERS: actions ===================
  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const res = await fetch(`${askme_API}/api/questions/${selected.id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answerForm),
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || 'Failed to add answer');
      await loadAnswers(selected.id);
      setAnswerForm({ author: '', email: '', text: '' });
    } catch {
      alert('Could not reach Forum service (4000).');
    }
  };

  const backToList = () => { setSelected(null); setAnswers([]); };

  // =================== PRE-RENDER HELPERS ===================
  const filteredQuestions =
    categoryFilter === 'All' ? questions : questions.filter(q => q.category === categoryFilter);

  //


  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>AskMe – Forum</h1>
          <p className="tagline">
            A collaborative space for technical discussions.<br />
            Registered users can post questions, and visitors are welcome to share their answers.
          </p>
        </header>

        {/* User logged or not */}
        <section className="card" style={{ marginBottom: 20 }}>
          {currentUser ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                Logged in as <strong>{currentUser.name} {currentUser.surname}</strong> ({currentUser.email})
              </div>
              <button className="btn" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="small">You are not logged in. Please log in, or register if this is your first time.</div>
          )}
        </section>

        {/* User forms */}
        {!currentUser && (
          <section className="card">
            <div style={{ display: 'grid', gap: 20 }}>
              {/* Register */}
              <div>
                <h2 className="section-title">Register</h2>
                <form onSubmit={registerUser}>
                  <label className="label">Your name</label>
                  <input className="input" name="name" value={registerForm.name} onChange={handleRegisterChange} />
                  <div style={{ height: 10 }} />
                  <label className="label">Your surname</label>
                   <input className="input" name="surname" value={registerForm.surname} onChange={handleRegisterChange} />
<div style={{ height: 10 }} />
                  <label className="label">Your email</label>
                  <input className="input" name="email" value={registerForm.email} onChange={handleRegisterChange} />
                  <div style={{ height: 12 }} />
                  <button type="submit" className="btn">Register</button>
                </form>
              </div>

              <hr className="divider" />

              {/* Login */}
              <div>
                <h2 className="section-title">Login</h2>
                <form onSubmit={loginUser}>
                  <label className="label">Email</label>
                  <input className="input" name="email" value={loginForm.email} onChange={handleLoginChange} />
                  <div style={{ height: 12 }} />
                  <button type="submit" className="btn">Login</button>
                </form>
              </div>
            </div>

            {authMsg && <p className="small" style={{ marginTop: 10 }}>{authMsg}</p>}
          </section>
        )}

        {/* Opened question view */}
        {selected ? (
          <section className="card">
            <button onClick={backToList} className="btn" style={{ marginBottom: 12 }}>← Back</button>
            <h2 style={{ margin: '6px 0 8px' }}>{selected.title}</h2>
            <p>{selected.description}</p>
            <p className="small">
              Category: {selected.category} | Author: {selected.author} | Views: {selected.views}
              {selected.tags?.length ? <> | Tags: {Array.isArray(selected.tags) ? selected.tags.join(', ') : selected.tags}</> : null}
            </p>

            <hr className="divider" />
           {/* Answers*/}
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
            {/* Add your answer*/}
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
                Only <strong>logged-in (registered)</strong> users can post questions. Visitors can answer any question.
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
                <label className="label">Author</label>


                <input className="input" name="author" value={questionForm.author} onChange={handleQuestionChange} readOnly placeholder="Login to fill" />
                <div style={{ height: 12 }} />
                <button type="submit" className="btn" disabled={!currentUser}>Post Question</button>
              </form>
              {questionMsg && <p className="small" style={{ marginTop: 12 }}>{questionMsg}</p>}
            </section>


            {/* Questions list */}
            <section className="card" style={{ paddingBottom: 10 }}>
              <h2 className="section-title" style={{ marginBottom: 6 }}>All Questions</h2>
              <label className="label">Filter by category</label>
              <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categoriesForFilter.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </section>

            <section>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filteredQuestions.map(q => (
                  <li key={q.id} className="q-item" style={{ marginBottom: 14 }}>
                    <h3>{q.title}</h3>
                    <p className="small" style={{ marginTop: -2, marginBottom: 8 }}>{q.description}</p>
                    <div className="q-meta">
                      Category: {q.category} | Author: {q.author} | Views: {q.views}
                      {q.tags?.length ? <> | Tags: {Array.isArray(q.tags) ? q.tags.join(', ') : q.tags}</> : null}
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
