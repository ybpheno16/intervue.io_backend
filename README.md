# 🗳️ Live Polling Backend (Express + Socket.io)

This is the backend server for a real-time polling system built using **Node.js**, **Express**, and **Socket.io**. It supports two roles: **Teacher** and **Student**, allowing live polls to be conducted with real-time vote updates.

---

## 🚀 Features

### 👨‍🏫 Teacher
- Create a new poll with question, options, timer, and correct answer
- View live voting stats
- Automatically end poll when all students vote or time expires

### 👨‍🎓 Student
- Join using a unique name (per tab)
- Submit vote for active poll
- See real-time results after voting or after timeout (60s default)

---

## ⚙️ Technologies Used
- **Node.js**
- **Express.js**
- **Socket.io**
- **CORS**
- **dotenv**

---

## 📦 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/live-poll-backend.git
cd live-poll-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Environment Variables
Create a `.env` file (optional):
```env
PORT=3000
```

### 4. Run the Server
```bash
node index.js
```

The server will start on `http://localhost:3000` (or the port you specify).

---

## 🌐 CORS Configuration

The server allows requests from:
- `http://localhost:5173` (for local frontend development)
- `https://intervue-assignment-frontend.vercel.app` (deployed frontend)

Update the CORS `origin` array in `index.js` if your frontend is hosted elsewhere.

---

## 🔗 Deployment

To deploy this backend (e.g., on Render):
- Push code to GitHub
- Create a new **Web Service** on [Render.com](https://render.com)
- Set:
  - **Build Command**: `npm install`
  - **Start Command**: `node index.js`
- Set environment variable `PORT` if needed

---

## 📁 File Overview

- `index.js` – Main server file handling:
  - Socket connections
  - Poll state management
  - Broadcasting poll start, vote updates, and final results

---

## ✍️ Author

Made with ❤️ by Yashendra Badal  
[LinkedIn](https://www.linkedin.com/in/yashendrabadal/) | [GitHub](https://github.com/ybpheno16)

---

## 📜 License

This project is licensed for educational use.
