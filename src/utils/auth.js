import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from './logger.js';

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '8h'; // alinha com uso real de sessão

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (payload) => {
  const tokenPayload = typeof payload === 'object' ? payload : { id: payload };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};
