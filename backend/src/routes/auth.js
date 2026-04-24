const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const { data: existingUser, error: findError } = await db.from('users').select('id').eq('email', email).maybeSingle();
    if (findError) throw findError;
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const resolvedRole = role === 'ADMIN' ? 'ADMIN' : 'AGENT';
    const status = 'PENDING';

    const { data: newUser, error } = await db.from('users').insert([{
      name,
      email,
      password: hashedPassword,
      role: resolvedRole,
      status
    }]).select().single();

    if (error) throw error;

    res.status(201).json({ message: 'User registered, awaiting admin approval', user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status } });
  } catch (error) {
    console.error('SERVER ERROR IN /REGISTER:', error);
    res.status(500).json({ error: error.message || error.details || JSON.stringify(error) || 'Failed to register' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data: user, error: findError } = await db.from('users').select('*').eq('email', email).maybeSingle();
    if (findError) throw findError;
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
    
    if (user.status === 'PENDING') {
      return res.status(403).json({ error: 'Your account is pending admin approval.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }
    });
  } catch (error) {
    console.error('SERVER ERROR IN /LOGIN:', error);
    res.status(500).json({ error: error.message || error.details || JSON.stringify(error) || 'Failed to login' });
  }
});

module.exports = router;
