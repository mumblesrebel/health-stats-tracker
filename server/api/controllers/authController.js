const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  console.log('Registration request received:', {
    body: req.body,
    headers: req.headers,
    method: req.method,
    path: req.path
  });
  
  try {
    const { email, password, firstName, lastName } = req.body;
    console.log('Parsed registration data:', { email, firstName, lastName });

    if (!email || !password || !firstName || !lastName) {
      console.error('Registration failed: Missing required fields', { email, firstName, lastName });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log('Existing user check:', existingUser ? 'Found' : 'Not found');
    
    if (existingUser) {
      console.log('Registration failed: Email already exists');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName
    });
    console.log('Created user model:', { 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    await user.save();
    console.log('User saved to database with ID:', user._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('Generated JWT token');

    const response = {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
    console.log('Preparing response:', response);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    console.log('Sending response with headers:', {
      status: 201,
      headers: res.getHeaders(),
      body: response
    });
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Error registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};
