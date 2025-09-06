# AskMe Forum

This project is created for the **Advanced Topics on Web Engineering** course at UBT.  
It is a small forum application where users can register, login, ask questions and answer questions.

## Features
- Register with name and email (saved in a JSON file so users are not lost after restart)
- Login / Logout for registered users
- Only registered users can add new questions
- Visitors can add answers (name required, email optional)
- Questions have categories, tags and a counter for views
- Built with two microservices:
  - Forum Service (port 5000) → questions, answers, views
  - Users Service (port 5001) → registration, login, saved in `users.json`
- GitHub used for version control and teamwork

## Tech Stack
- Frontend: React, Vite, JavaScript  
- Backend: Node.js, Express  
- Architecture: Microservices  
- Data storage: JSON file (`users.json`)  
- Tool: Visual Studio Code  
- Version Control: GitHub  



