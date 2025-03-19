// src/types/next-auth.d.ts
import 'next-auth';
import { Role } from './user';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  }
}