# 🐞 Bug Tracker App (MERN Stack)

This is a full-stack Bug Tracker application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It helps users log, manage, and track software bugs. The app is ideal for software teams, educational institutions running tech programs, and hackathon environments.

---

## 🔧 Technologies Used

### Frontend
- React.js
- Axios
- Tailwind CSS
- React Router
- React Hook Form / useState

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- Multer (for file uploads)
- dotenv (for environment configs)

---

## 📦 Features

- Submit new bugs with title, description, category, priority, and attachments
- View all submitted bugs in a list
- Store files like images or PDFs
- Input validation for clean data submission
- Responsive design for mobile and desktop use

---

## 🧑‍💻 How to Run the App

### 1. Clone the repository
```bash
git clone https://github.com/your-username/bug-tracker.git
cd bug-tracker
```

### 2. Install dependencies

#### Backend
```bash
cd server
pnpm install
```

#### Frontend
```bash
cd ../client
pnpm install
```

### 3. Setup environment variables

Create a `.env` file in `/server`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Create a `.env` file in `/client`:
```
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Run the application

#### Backend (in `/server`)
```bash
pnpm dev
```

#### Frontend (in `/client`)
```bash
pnpm dev
```

Visit the frontend at [http://localhost:5173](http://localhost:5173)

---

## 🚀 Future Improvements

- Admin dashboard with role-based access
- Authentication (JWT-based)
- Bug assignment to users
- Status updates and notifications
- Advanced filtering, search, and sorting
- Export bug data to CSV or PDF

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss the proposed changes.

---
