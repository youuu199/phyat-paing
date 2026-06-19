import { Schema, model } from 'mongoose';

/**
 * User document schema.
 *
 * Fields:
 *  - email:        Unique user email (lowercased, trimmed)
 *  - passwordHash: bcryptjs-hashed password (never store plaintext)
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
  },
  { timestamps: true }
);

const User = model('User', userSchema);

export default User;
