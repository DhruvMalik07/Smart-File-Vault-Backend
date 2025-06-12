// Load environment variables first
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Debug environment variables immediately after loading
console.log('Current working directory:', process.cwd());
console.log('Environment file path:', path.join(__dirname, '.env'));
console.log('Environment Variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT || 5000);

// Verify JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not set in environment variables!');
    process.exit(1);
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));

app.get('/', (req, res) => {
    res.send('Smart File Vault API is running!');
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_file_vault';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../frontend/build')));
        
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
        });
    }

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    
}).catch(err => {
    console.error('Connection to MongoDB failed', err);
}); 