import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import pool from '@/config/database.js';
import { type NewUser, type LoginUser } from '@/models/user.model.js';
import { encrypt } from './crypto.service.js';
import { cpf as cpfValidator, cnpj as cnpjValidator } from 'cpf-cnpj-validator';

/**
 * Registers a new user in the database.
 * @param user - The user data for registration.
 * @returns The newly created user.
 * @throws Will throw an error if the email is already in use.
 */
export async function register(user: NewUser) {
  const { full_name, email, password, cpf, phone } = user;
  const lowerCaseEmail = email.toLowerCase();

  // Validate CPF/CNPJ
  const cleanedCpf = cpf.replace(/\D/g, '');
  if (!((cleanedCpf.length === 11 && cpfValidator.isValid(cleanedCpf)) || (cleanedCpf.length === 14 && cnpjValidator.isValid(cleanedCpf)))) {
    throw new Error('Invalid CPF or CNPJ.');
  }


  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [lowerCaseEmail]);
    if (existingUser.rows.length > 0) {
      throw new Error('Email already in use.');
    }

    // Hash password and encrypt CPF
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const encryptedCpf = encrypt(cleanedCpf);

    // Save user to database
    const newUserResult = await client.query(
      'INSERT INTO users (full_name, email, cpf, phone, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, created_at',
      [full_name, lowerCaseEmail, encryptedCpf, phone, passwordHash]
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
  const lowerCaseEmail = email.toLowerCase();

  const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [lowerCaseEmail]);
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

export async function forgotPassword(email: string) {
  const client = await pool.connect();
  try {
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // To prevent email enumeration, we don't throw an error here.
      // The user will see the same message whether the email exists or not.
      return;
    }
    const user = userResult.rows[0];

    const resetToken = (await import('crypto')).randomBytes(32).toString('hex');
    const passwordResetToken = (await import('crypto'))
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await client.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, passwordResetToken, passwordResetExpires]
    );

    // In a real application, you would send an email here.
    // For this example, we'll log the token to the console.
    console.log(`Password reset token for ${email}: ${resetToken}`);
    // The reset URL would be something like:
    // http://localhost:3000/reset-password?token=${resetToken}

  } finally {
    client.release();
  }
}

export async function resetPassword(token: string, password: string) {
  const hashedToken = (await import('crypto'))
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tokenResult = await client.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error('Token is invalid or has expired.');
    }

    const userId = tokenResult.rows[0].user_id;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
    await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]); // Invalidate all tokens for the user

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
