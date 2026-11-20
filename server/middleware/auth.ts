import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'flytrox-jwt-secret-key-2026';
const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@flytroxtravels.in').toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Flytrox@2026';
const DEFAULT_ADMIN_HASH = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);

export interface AdminTokenPayload {
  email: string;
  role: 'admin';
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  if (email.trim().toLowerCase() !== DEFAULT_ADMIN_EMAIL) {
    return false;
  }
  return bcrypt.compare(password, DEFAULT_ADMIN_HASH);
}

export function signAdminToken(email: string): string {
  const payload: AdminTokenPayload = { email: email.toLowerCase(), role: 'admin' };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in as admin.' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions.' });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired admin session. Please sign in again.' });
  }
}
