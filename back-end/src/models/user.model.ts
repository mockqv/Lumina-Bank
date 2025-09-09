// Interface for creating a new user
export interface NewUser {
  full_name: string;
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
  full_name: string;
  email: string;
  created_at: Date;
}
