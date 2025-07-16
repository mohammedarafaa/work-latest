export enum AccountType {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM' // customer service
} 
 export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    user_image?: string;
    AccountType?: 'ADMIN' | 'CUSTOMER' | 'SYSTEM';
    status?: 'active' | 'inactive' | 'suspended';
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // src/app/core/api/models/auth.model.ts
  export interface AuthToken {
    accessToken: string;
    refreshToken: string;
    username: string;
    expiresIn: number;
    expirationAt: number;
    accountType: AccountType;
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  // src/app/core/api/models/response.model.ts
  export interface ApiResponse<T> {
    status: number;
    success: boolean;
    message?: string;
    data?: T;
    errors?: { [key: string]: string[] };
  }
  