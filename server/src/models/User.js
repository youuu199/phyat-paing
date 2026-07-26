import { Schema, model } from 'mongoose';

/**
 * User document schema.
 *
 * Fields:
 *  - email:        Unique user email (lowercased, trimmed)
 *  - passwordHash: bcryptjs-hashed password (never store plaintext)
 *  - loginAttempts: Number of consecutive failed login attempts
 *  - lockUntil:     Date when the account lock expires (null = not locked)
 *
 * Timestamps: createdAt + updatedAt auto-managed by Mongoose.
 */
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },

    // --- Profile ---
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    avatarPublicId: {
      type: String,
      default: '',
    },

    // --- Settings ---
    currency: {
      type: String,
      default: 'USD',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    budgetAlerts: {
      enabled: { type: Boolean, default: true },
      monthlyLimit: { type: Number, default: 0 },
      categoryLimits: {
        type: Map,
        of: Number,
        default: {},
      },
    },
  },
  { timestamps: true }
);

/**
 * Check if the account is currently locked.
 * @returns {boolean}
 */
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

/**
 * Increment failed login attempts. Locks the account after 5 attempts for 15 minutes.
 * Uses atomic MongoDB operations to prevent race conditions under concurrent requests.
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // If lock has expired, reset attempts atomically
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Always increment atomically — no read-then-write race
  const result = await this.updateOne({ $inc: { loginAttempts: 1 } });

  // Re-read the updated value to decide if we should lock
  // Use $gte to handle concurrent requests that all push past the threshold
  await this.updateOne(
    { loginAttempts: { $gte: 5 }, lockUntil: { $eq: null } },
    { $set: { lockUntil: Date.now() + 15 * 60 * 1000 } }
  );

  return result;
};

/**
 * Reset login attempts on successful login.
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

const User = model('User', userSchema);

export default User;
