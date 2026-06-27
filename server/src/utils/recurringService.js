import cron from 'node-cron';
import Bill from '../models/Bill.js';

/**
 * Creates new bill copies for recurring bills whose due date has passed.
 * Runs daily at midnight server time.
 */
async function processRecurringBills() {
  try {
    const now = new Date();

    // System-wide query — processes all users' recurring bills
    const recurringBills = await Bill.find({
      isRecurring: true,
      recurringInterval: { $exists: true, $ne: null },
      dueDate: { $lte: now },
    });

    let created = 0;

    for (const bill of recurringBills) {
      // Calculate next due date based on interval
      const nextDueDate = new Date(bill.dueDate);
      switch (bill.recurringInterval) {
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          break;
        default:
          continue;
      }

      // Only create if the next due date is in the future
      if (nextDueDate <= now) continue;

      // Check if a bill with this next due date already exists (avoid duplicates)
      const exists = await Bill.findOne({
        userId: bill.userId,
        title: bill.title,
        dueDate: nextDueDate,
        isRecurring: true,
      });

      if (exists) continue;

      // Create new bill copy
      await Bill.create({
        userId: bill.userId,
        title: bill.title,
        amount: bill.amount,
        category: bill.category,
        imageUrl: bill.imageUrl,
        cloudinaryPublicId: '', // Don't duplicate the Cloudinary reference
        rawText: bill.rawText,
        dueDate: nextDueDate,
        isRecurring: true,
        recurringInterval: bill.recurringInterval,
        isPaid: false,
      });

      // Mark the old bill as no longer recurring (it's been superseded)
      bill.isRecurring = false;
      await bill.save();

      created++;
    }

    if (created > 0) {
      console.log(`[recurring] Created ${created} recurring bill(s)`);
    }
  } catch (err) {
    console.error('[recurring] Error processing recurring bills:', err.message);
  }
}

/**
 * Starts the recurring bill scheduler.
 * Runs daily at midnight (00:00).
 */
export function startRecurringService() {
  // Run on startup
  processRecurringBills();

  // Schedule daily at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('[recurring] Running daily recurring bill check...');
    processRecurringBills();
  });

  console.log('[recurring] Service started — checks daily at midnight');
}
