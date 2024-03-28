// router.js
import { Router } from 'express';
import passport from 'passport';
import { User, Message } from './models'; // Assuming this is where models are defined
import bcrypt from 'bcryptjs';

const router = Router();

// Register user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  try {
    const newUser = new User({ username, password: hash });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering new user.');
  }
});

// Login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

// Save message
router.post('/message', async (req, res) => {
  const { username, message } = req.body;
  try {
    const newMessage = new Message({ username, message });
    await newMessage.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving message.');
  }
});

export default router;
