import { Request, Response } from 'express';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { 
  generateToken, 
  hashPassword, 
  comparePassword,
  generateReferralCode 
} from '../utils/auth';
import { AuthRequest } from '../middleware/auth';
import validator from 'validator';

// Register user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, phone, firstName, lastName, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return sendError(res, 'Missing required fields', 400);
    }

    if (!validator.isEmail(email)) {
      return sendError(res, 'Invalid email address', 400);
    }

    if (password.length < 8) {
      return sendError(res, 'Password must be at least 8 characters', 400);
    }

    if (password !== confirmPassword) {
      return sendError(res, 'Passwords do not match', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      phone,
      firstName,
      lastName,
      password: hashedPassword,
      referralCode: generateReferralCode(),
      preferences: {
        newsletter: true,
        sms: true,
        pushNotifications: true,
        language: 'en',
      },
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    return sendSuccess(
      res,
      'User registered successfully',
      { user: userResponse, token },
      201
    );
  } catch (error: any) {
    return sendError(res, 'Error registering user', 500, error);
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Check if account is active
    if (user.status === 'suspended' || user.status === 'blacklisted') {
      return sendError(res, 'Your account has been suspended', 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password || '');
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data
    const userResponse = user.toObject();
    delete userResponse.password;

    return sendSuccess(res, 'Login successful', { user: userResponse, token });
  } catch (error: any) {
    return sendError(res, 'Error during login', 500, error);
  }
};

// Get current user profile
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('wishlist', 'name slug images.front price discountPrice');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, 'User profile fetched', user);
  } catch (error: any) {
    return sendError(res, 'Error fetching user profile', 500, error);
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        avatar: avatar || undefined,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, 'Profile updated successfully', user);
  } catch (error: any) {
    return sendError(res, 'Error updating profile', 500, error);
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, 'All fields are required', 400);
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 'New passwords do not match', 400);
    }

    if (newPassword.length < 8) {
      return sendError(res, 'Password must be at least 8 characters', 400);
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password || '');
    if (!isPasswordValid) {
      return sendError(res, 'Current password is incorrect', 401);
    }

    // Hash new password
    user.password = await hashPassword(newPassword);
    await user.save();

    return sendSuccess(res, 'Password changed successfully');
  } catch (error: any) {
    return sendError(res, 'Error changing password', 500, error);
  }
};

// Add address
export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { label, fullName, phone, email, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const address = {
      label,
      fullName,
      phone,
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      isDefault,
      createdAt: new Date(),
    };

    user.addresses.push(address as any);
    
    if (isDefault) {
      user.defaultShippingAddress = address as any;
    }

    await user.save();

    return sendSuccess(res, 'Address added successfully', user.addresses, 201);
  } catch (error: any) {
    return sendError(res, 'Error adding address', 500, error);
  }
};

// Update address
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.params;
    const updateData = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const addressIndex = user.addresses.findIndex((addr: any) => addr._id?.toString() === addressId);
    if (addressIndex === -1) {
      return sendError(res, 'Address not found', 404);
    }

    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updateData };
    await user.save();

    return sendSuccess(res, 'Address updated successfully', user.addresses);
  } catch (error: any) {
    return sendError(res, 'Error updating address', 500, error);
  }
};

// Delete address
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.addresses = user.addresses.filter((addr: any) => addr._id?.toString() !== addressId);
    await user.save();

    return sendSuccess(res, 'Address deleted successfully', user.addresses);
  } catch (error: any) {
    return sendError(res, 'Error deleting address', 500, error);
  }
};

// Add to wishlist
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', 'name slug images.front price discountPrice');

    return sendSuccess(res, 'Product added to wishlist', user?.wishlist);
  } catch (error: any) {
    return sendError(res, 'Error adding to wishlist', 500, error);
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', 'name slug images.front price discountPrice');

    return sendSuccess(res, 'Product removed from wishlist', user?.wishlist);
  } catch (error: any) {
    return sendError(res, 'Error removing from wishlist', 500, error);
  }
};

// Get wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).populate('wishlist', 'name slug images.front price discountPrice avgRating totalReviews');

    return sendSuccess(res, 'Wishlist fetched', user?.wishlist || []);
  } catch (error: any) {
    return sendError(res, 'Error fetching wishlist', 500, error);
  }
};
