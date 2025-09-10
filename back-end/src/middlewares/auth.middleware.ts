import { type Request, type Response, type NextFunction } from 'express';
import { jwtVerify } from 'jose';

interface AuthRequest extends Request {
  user?: any; // or a more specific user type
}

export async function protect(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables.');
    }
    const secretKey = new TextEncoder().encode(jwtSecret);

    const { payload } = await jwtVerify(token, secretKey);

    // Attach user to the request object
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
}
