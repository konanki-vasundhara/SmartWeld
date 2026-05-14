const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Helps in some environments
  }
});

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const otpStore = new Map();

const requestEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, { otp, expiry });

    // Send REAL Email
    const mailOptions = {
      from: `"Smart Weld Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Smart Weld Access Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF5F00; margin: 0;">SMART WELD</h1>
            <p style="color: #666; font-size: 14px;">Industrial AI & Precision Management</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Your secure verification code is:</p>
            <h2 style="font-size: 42px; letter-spacing: 10px; color: #06101D; margin: 0; font-weight: 900;">${otp}</h2>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">This code will expire in 10 minutes. Do not share it with anyone.</p>
          </div>
          <p style="color: #999; font-size: 10px; text-align: center; margin-top: 40px; text-transform: uppercase; letter-spacing: 2px;">
            ISO 9606 CERTIFIED • SECURE INDUSTRIAL PORTAL
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.info(`[REAL EMAIL] OTP sent to ${email}`);

    res.json({ message: 'OTP sent successfully to your email.' });
  } catch (error) {
    console.error('Email Send Error:', error);
    
    // Fallback for dev: show OTP in console so user can still test
    const storedData = otpStore.get(req.body.email);
    if (storedData) {
      console.warn(`[DEV FALLBACK] OTP for ${req.body.email} is: ${storedData.otp}`);
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        error: 'Email configuration missing in .env' 
      });
    }

    res.status(500).json({ 
      error: `Failed to send OTP email: ${error.message}` 
    });
  }
};

const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp, userData } = req.body;
    
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const storedData = otpStore.get(email);

    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // OTP is valid, remove it
    otpStore.delete(email);

    // Find or Create User
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // First time registration
      user = await User.create({
        email,
        displayName: userData?.displayName || 'Industrial User',
        workshopName: userData?.workshopName || '',
        specialization: userData?.specialization || 'Industrial Welding',
        phoneNumber: userData?.phoneNumber || null,
        role: 'technician',
        preferences: {
          notifications: true,
          language: 'en',
          currency: 'INR',
          theme: 'dark'
        },
        stats: {
          totalScans: 0,
          totalBookings: 0,
          totalSpent: 0,
          accuracyRate: 0
        }
      });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        workshopName: user.workshopName,
        specialization: user.specialization,
        stats: user.stats,
        preferences: user.preferences
      },
      token
    });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

const register = async (req, res) => {
  try {
    const { phoneNumber, email, displayName, workshopName, specialization, firebaseUid } = req.body;

    const existingUser = await User.findOne({
      where: phoneNumber ? { phoneNumber } : { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already registered' });
    }

    const user = await User.create({
      phoneNumber,
      email,
      displayName,
      workshopName,
      specialization,
      isVerified: !!firebaseUid
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        displayName: user.displayName,
        workshopName: user.workshopName,
        stats: user.stats
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { phoneNumber, email, password, firebaseUid } = req.body;

    let user;
    if (phoneNumber) {
      user = await User.findOne({ where: { phoneNumber } });
    } else if (email) {
      user = await User.findOne({ where: { email } });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (password && !firebaseUid) {
      if (!(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } 

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        displayName: user.displayName,
        workshopName: user.workshopName,
        specialization: user.specialization,
        stats: user.stats,
        preferences: user.preferences
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        workshopName: user.workshopName,
        specialization: user.specialization,
        phoneNumber: user.phoneNumber,
        avatar: user.profileImage,
        stats: user.stats,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { displayName, workshopName, specialization, phoneNumber, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      displayName: displayName || user.displayName,
      workshopName: workshopName || user.workshopName,
      specialization: specialization || user.specialization,
      phoneNumber: phoneNumber || user.phoneNumber,
      profileImage: avatar || user.profileImage
    });

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        workshopName: user.workshopName,
        specialization: user.specialization,
        phoneNumber: user.phoneNumber,
        avatar: user.profileImage,
        stats: user.stats,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile', 
      details: error.message,
      originalError: error.original?.message 
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  requestEmailOTP,
  verifyEmailOTP
};
