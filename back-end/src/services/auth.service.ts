import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import pool from '@/config/database.js';
import { type NewUser, type LoginUser } from '@/models/user.model.js';
import { encrypt } from './crypto.service.js';

/**
 * Registers a new user in the database.
 * @param user - The user data for registration.
 * @returns The newly created user.
 * @throws Will throw an error if the email is already in use.
 */
export async function register(user: NewUser) {
  const { full_name, email, password, cpf } = user;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('Email already in use.');
    }

    // Hash password and encrypt CPF
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const encryptedCpf = encrypt(cpf);

    // Save user to database
    const newUserResult = await client.query(
      'INSERT INTO users (full_name, email, cpf, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, created_at',
      [full_name, email, encryptedCpf, passwordHash]
    );

    const newUser = newUserResult.rows[0];

    // Create a default checking account for the new user
    const agency = '0001'; // Default agency
    const accountNumber = Math.floor(100000 + Math.random() * 900000).toString();
    await client.query(
        'INSERT INTO accounts (user_id, agency, account_number, account_type, balance) VALUES ($1, $2, $3, $4, $5)',
        [newUser.id, agency, accountNumber, 'checking', 0]
    );

    await client.query('COMMIT');
    return newUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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
    full_name: user.full_name,
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
