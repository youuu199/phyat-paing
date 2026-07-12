import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryStorage.js';
import { getCurrentRates } from '../utils/currencyConversion.js';

/**
 * GET /api/v1/users/me
 * Returns full profile + settings for the authenticated user.
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select(
      'email displayName avatarUrl currency theme budgetAlerts createdAt'
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      currency: user.currency,
      theme: user.theme,
      budgetAlerts: {
        enabled: user.budgetAlerts?.enabled ?? true,
        monthlyLimit: user.budgetAlerts?.monthlyLimit ?? 0,
        categoryLimits: Object.fromEntries(user.budgetAlerts?.categoryLimits || new Map()),
      },
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/users/profile
 * Update display name.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { displayName } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (displayName !== undefined) {
      user.displayName = displayName.trim();
    }

    await user.save();

    res.json({
      message: 'Profile updated',
      displayName: user.displayName,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/users/avatar
 * Upload or replace avatar image.
 */
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.avatarPublicId) {
      try {
        await deleteFromCloudinary(user.avatarPublicId);
      } catch {
        // Old avatar deletion is non-critical
      }
    }

    // Upload new avatar
    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    user.avatarUrl = url;
    user.avatarPublicId = publicId;
    await user.save();

    res.json({
      message: 'Avatar updated',
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/users/avatar
 * Remove avatar image.
 */
export const deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.avatarPublicId) {
      try {
        await deleteFromCloudinary(user.avatarPublicId);
      } catch {
        // Non-critical
      }
    }

    user.avatarUrl = '';
    user.avatarPublicId = '';
    await user.save();

    res.json({ message: 'Avatar removed' });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/users/password
 * Change password (requires current password).
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must contain at least one number' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/users/settings
 * Update settings (currency, theme, budget alerts).
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { currency, theme, budgetAlerts } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currency !== undefined) user.currency = currency;
    if (theme !== undefined) user.theme = theme;

    if (budgetAlerts !== undefined) {
      if (!user.budgetAlerts) {
        user.budgetAlerts = {};
      }
      if (budgetAlerts.enabled !== undefined) {
        user.budgetAlerts.enabled = budgetAlerts.enabled;
      }
      if (budgetAlerts.monthlyLimit !== undefined) {
        user.budgetAlerts.monthlyLimit = budgetAlerts.monthlyLimit;
      }
      if (budgetAlerts.categoryLimits !== undefined) {
        user.budgetAlerts.categoryLimits = new Map(
          Object.entries(budgetAlerts.categoryLimits)
        );
      }
    }

    await user.save();

    res.json({
      message: 'Settings updated',
      currency: user.currency,
      theme: user.theme,
      budgetAlerts: {
        enabled: user.budgetAlerts?.enabled ?? true,
        monthlyLimit: user.budgetAlerts?.monthlyLimit ?? 0,
        categoryLimits: Object.fromEntries(user.budgetAlerts?.categoryLimits || new Map()),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/stats
 * Returns user account statistics.
 */
export const getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('createdAt');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Count bills
    const { default: Bill } = await import('../models/Bill.js');
    const totalBills = await Bill.countDocuments({ userId: req.userId });
    const totalPaid = await Bill.countDocuments({ userId: req.userId, isPaid: true });

    // Total spent
    const spendingResult = await Bill.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalSpent = spendingResult[0]?.total || 0;

    res.json({
      memberSince: user.createdAt,
      totalBills,
      totalPaid,
      totalUnpaid: totalBills - totalPaid,
      totalSpent,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/rates
 * Returns live exchange rates (1 unit of currency = X MMK).
 */
export const getRates = async (req, res, next) => {
  try {
    const rates = await getCurrentRates();
    res.json({ rates, baseCurrency: 'MMK' });
  } catch (err) {
    next(err);
  }
};
