import { type Request, type Response, type NextFunction } from 'express';
import { jwtVerify } from 'jose';

interface AuthRequest extends Request {
  user?: any; // or a more specific user type
}

export async function protect(req: AuthRequest, res: Response, next: NextFunction) {
  let token;

  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
    token = cookies['token'];
  }

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
