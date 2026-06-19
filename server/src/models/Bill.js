import { Schema, model } from 'mongoose';

/**
 * Bill document schema.
 *
 * Fields:
 *  - userId:   Owner of this bill (references User model)
 *  - title:    Human-readable bill name (e.g. "March Electricity Bill")
 *  - amount:   Total in MMK (e.g. 25000)
 *  - category: Classification enum
 *  - imageUrl: Public Cloudinary URL (secure_url) of the uploaded image
 *  - rawText:  Original OCR text for debugging/reprocessing
 *
 * Timestamps: createdAt + updatedAt are auto-managed by Mongoose.
 */
const billSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['Electricity', 'Water', 'Internet', 'Phone', 'Shopping', 'Other'],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    rawText: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Bill = model('Bill', billSchema);

export default Bill;
