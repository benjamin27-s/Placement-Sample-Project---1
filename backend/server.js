require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Frontend Static Files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Review Moderation API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    // Check if request is for API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: `Route ${req.originalUrl} not found`
        });
    }

    // For other requests, try to serve index.html or 404 page
    // Since we are using express.static, if file not found, we land here.
    // For SPA we would send index.html, but for MPA we can send a custom 404 or just redirect.
    // Let's send a simple 404 JSON for now to avoid loops, but if it was SPA:
    // res.sendFile(path.join(__dirname, '../frontend/index.html'));

    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
🚀 Review Moderation API Server
================================
📍 Port: ${PORT}
📦 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started: ${new Date().toLocaleString()}
  `);
});
