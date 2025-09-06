# AskMe Forum

A simple forum web application built for the **Advanced Topics on Web Engineering** course at UBT.  
The project demonstrates microservices architecture using JavaScript (React + Node.js).

---

## 🚀 Features
- User registration (name + email) with **persistent storage in `users.json`**
- Login / Logout system for forum users
- Only registered users can post new questions
- Visitors can post answers (name required, email optional)
- Questions include **tags, categories, and view counters**
- Two microservices:
  - **Forum Service (port 5000)** → manages questions, answers, views
  - **Users Service (port 5001)** → manages registration, login, and persistence
- Hosted on **GitHub** for version control and collaboration

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, JavaScript
- **Backend:** Node.js + Express
- **Architecture style:** Microservices
- **Persistence:** JSON file (`users.json`) for registered users
- **Version Control:** GitHub
- **Development Tool:** Visual Studio Code

---

## 📂 Project Structure
