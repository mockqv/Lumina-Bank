import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import pool from '@/config/database.js';
import { type NewUser, type LoginUser } from '@/models/user.model.js';

/**
 * Registers a new user in the database.
 * @param user - The user data for registration.
 * @returns The newly created user.
 * @throws Will throw an error if the email is already in use.
 */
export async function register(user: NewUser) {
  const { full_name, email, password } = user;

  // Check if user already exists
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('Email already in use.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Save user to database
  const newUserResult = await pool.query(
    'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at',
    [full_name, email, passwordHash]
  );

  return newUserResult.rows[0];
}

/**
 * Authenticates a user and generates a JWT.
 * @param credentials - The user's login credentials.
 * @returns An object containing the JWT.
 * @throws Will throw an error for invalid credentials.
 */
export async function login(credentials: LoginUser) {
  const { email, password } = credentials;

  const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    throw new Error('Invalid credentials.');
  }

  const user = userResult.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error('Invalid credentials.');
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
  }

  const secretKey = new TextEncoder().encode(jwtSecret);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '1h')
    .sign(secretKey);

  return { token };
}
