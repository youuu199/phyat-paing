import { Schema, model } from 'mongoose';

/**
 * Bill document schema.
 *
 * Fields:
 *  - title:    Human-readable bill name (e.g. "March Electricity Bill")
 *  - amount:   Total in MMK (e.g. 25000)
 *  - category: Classification enum
 *  - imageUrl: Public Firebase Storage URL of the uploaded image
 *  - rawText:  Original OCR text for debugging/reprocessing
 *
 * Timestamps: createdAt + updatedAt are auto-managed by Mongoose.
 *
 * Anti-patterns avoided:
 *  - No unique:true on title (users may have duplicate bill names)
 *  - enum at Mongoose level (MongoDB does not enforce enums natively)
 *  - timestamps: true (adds createdAt/updatedAt automatically)
 */
const billSchema = new Schema(
  {
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
