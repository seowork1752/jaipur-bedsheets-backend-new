import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-min-32-characters-long';
const JWT_EXPIRE: string = process.env.JWT_EXPIRE || '7d';

// Generate JWT Token
export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRE,
    } as jwt.SignOptions
  );
};

// Verify JWT Token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Hash Password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare Password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate Referral Code
export const generateReferralCode = (): string => {
  return 'REF' + Math.random().toString(36).substring(2, 15).toUpperCase();
};

// Generate Order Number
export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
};

// Generate SKU
export const generateSKU = (productId: string, variantId?: string): string => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SKU-${productId}-${variantId || 'DEFAULT'}-${random}`;
};
