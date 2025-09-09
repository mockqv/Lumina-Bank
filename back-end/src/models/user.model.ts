// Interface for creating a new user
export interface NewUser {
  fullName: string;
  email: string;
  password: string;
}

// Interface for user login
export interface LoginUser {
  email: string;
  password: string;
}

// Interface for a user object returned from the database
export interface User {
  id: string; // uuid
  fullName: string;
  email: string;
  createdAt: Date;
}
