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
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock after 5 attempts for 15 minutes
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // 15 minutes
  }

  return this.updateOne(updates);
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
