require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// API info route
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Authentication API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
            },
            users: {
                profile: 'GET /api/users/profile (Protected)',
                updateProfile: 'PUT /api/users/profile (Protected)',
            },
        },
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📍 Browser Interface: http://localhost:${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    console.log(`\n📚 Available Endpoints:`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET    http://localhost:${PORT}/api/users/profile (Protected)`);
    console.log(`   PUT    http://localhost:${PORT}/api/users/profile (Protected)`);
    console.log(`\n🌐 Open http://localhost:${PORT} in your browser to test the API!`);
    console.log(`✨ Ready to accept requests!\n`);
});
