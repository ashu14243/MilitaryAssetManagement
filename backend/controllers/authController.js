import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
    const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    // Same message for unknown user / wrong password so usernames cannot be enumerated
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const payload = { id: user.id, username: user.username, role: user.role, baseId: user.base_id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    await db.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1,$2,$3)', [user.id, 'LOGIN', `User ${user.username} logged in`]);
    res.json({ token, user: payload });
  } catch (e) {
    res.status(500).json({ message: 'Login failed.' });
  }
};
