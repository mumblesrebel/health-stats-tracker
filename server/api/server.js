require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const healthRecordRoutes = require('./routes/healthRecords');

const app = express();

// Middleware
// Debug route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({ message: 'Health Stats API is running' });
});

// Enable CORS for all routes with debug logging
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
});

const corsOptions = {
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Response logging
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log('Response:', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      headers: res.getHeaders()
    });
    return originalSend.call(this, data);
  };
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body
  });
  next();
});

// Database connections
console.log('Attempting to connect to MongoDB...');
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set!');
  process.exit(1);
}

console.log('Using MongoDB URI:', process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@'));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Successfully connected to MongoDB');
  console.log('MongoDB connection state:', mongoose.connection.readyState);
  console.log('Connected to database:', mongoose.connection.name);
}).catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Connection details:', {
    readyState: mongoose.connection.readyState,
    error: err.message,
    code: err.code
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health-records', healthRecordRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
