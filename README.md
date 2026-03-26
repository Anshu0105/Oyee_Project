# OYEE - MERN Stack Anonymous Chat

This is a MERN stack application for anonymous chatting.

## Project Structure

```
oyee/
├── backend/
│   ├── models/
│   │   └── Message.js
│   ├── routes/
│   │   └── messages.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   └── package.json
└── README.md
```

## Setup Instructions

1. **Install Dependencies:**

   Backend:
   ```
   cd backend
   npm install
   ```

   Frontend:
   ```
   cd frontend
   npm install
   ```

2. **Set up MongoDB:**
   - Install MongoDB locally or use a cloud service like MongoDB Atlas
   - Create a database named 'oyee'
   - Update the connection string in `backend/server.js` if needed

3. **Run the Application:**

   Start the backend:
   ```
   cd backend
   npm run dev
   ```

   Start the frontend:
   ```
   cd frontend
   npm start
   ```

4. **Access the App:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Features

- Real-time anonymous chat using Socket.io
- Messages stored in MongoDB
- React frontend with Express backend