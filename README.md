# Review Moderation Platform

A full-stack web application for submitting and moderating product reviews with JWT authentication, role-based access control, and duplicate review prevention.

## 🚀 Features

- **JWT Authentication** - Secure login/registration with encrypted passwords
- **Role-Based Access** - Separate USER and MODERATOR dashboards
- **Review Submission** - Users can submit reviews with ratings
- **Moderation Controls** - Moderators can approve or reject reviews
- **Duplicate Prevention** - Backend enforces one review per user per item
- **Real-time Status** - Users can track review approval status

## 📁 Project Structure

```
prjct_1/
├── backend/
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── roleCheck.js     # Role authorization
│   ├── models/
│   │   ├── User.js          # User model
│   │   └── Review.js        # Review model (with unique constraint)
│   ├── routes/
│   │   ├── auth.js          # Auth endpoints
│   │   └── reviews.js       # Review endpoints
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Express server
├── frontend/
│   ├── css/styles.css       # Modern dark theme
│   ├── js/
│   │   ├── api.js           # API client
│   │   ├── auth.js          # Auth state management
│   │   └── app.js           # Main application logic
│   ├── index.html           # Landing page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── user-dashboard.html  # User dashboard
│   └── moderator-dashboard.html
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/review_moderation
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRES_IN=7d
   ```

4. Start the server:
   ```bash
   npm start
   ```

   The API will be running at `http://localhost:5000`

### Frontend Setup

1. Serve the frontend using any static server. Options:

   **Option A: VS Code Live Server**
   - Install Live Server extension
   - Right-click `index.html` → Open with Live Server

   **Option B: Using Python**
   ```bash
   cd frontend
   python -m http.server 5173
   ```

   **Option C: Using Node.js**
   ```bash
   npx serve frontend -p 5173
   ```

2. Open `http://localhost:5173` in your browser

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get token |
| GET | `/api/auth/me` | Get current user |

### Reviews (USER)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Submit a review |
| GET | `/api/reviews/my` | Get user's reviews |

### Reviews (MODERATOR)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Get all reviews |
| PUT | `/api/reviews/:id/approve` | Approve a review |
| PUT | `/api/reviews/:id/reject` | Reject a review |

## 👤 User Roles

### USER
- Register and login
- Submit reviews (one per item)
- View own reviews and status

### MODERATOR
- Login to system
- View all reviews
- Approve or reject reviews

## 🔒 Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens for API authentication
- Role-based middleware protection
- Input validation and sanitization
- XSS prevention in frontend

## 📝 License

ISC License
