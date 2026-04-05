require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const BackgroundScheduler = require('./utils/backgroundScheduler');

// Connect to database
connectDB();

// Initialize background scheduler
BackgroundScheduler.init();

const app = express();

// Security middleware - Configure helmet to allow cross-origin resources
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images) with CORS headers
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static('uploads'));

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/students', require('./routes/students'));
app.use('/api/v1/volunteers', require('./routes/volunteers'));
app.use('/api/v1/requests', require('./routes/requests'));
app.use('/api/v1/chat', require('./routes/chat'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/last-minute', require('./routes/lastMinute'));
app.use('/api/v1/matching', require('./routes/matching')); // AI-powered matching engine
app.use('/api/v1/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Schedule no-show detection to run daily at 2 AM
const { detectAndHandleNoShows } = require('./utils/noShowDetector');
const scheduleNoShowDetection = () => {
    // Run immediately for testing, then schedule for daily execution
    console.log('Running initial no-show detection...');
    detectAndHandleNoShows().then(result => {
        console.log('No-show detection result:', result);
    }).catch(error => {
        console.error('Error in no-show detection:', error);
    });

    // Schedule to run every day at 2 AM
    setInterval(async () => {
        try {
            console.log('Running scheduled no-show detection...');
            const result = await detectAndHandleNoShows();
            console.log('Scheduled no-show detection completed:', result);
        } catch (error) {
            console.error('Error in scheduled no-show detection:', error);
        }
    }, 24 * 60 * 60 * 1000); // 24 hours
};

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    // Start the no-show detection scheduler
    scheduleNoShowDetection();
    // Start the background scheduler for reactivation and ignored requests
    BackgroundScheduler.init();
});
