---
name: bill-organizer:db-seed
description: Seed MongoDB with realistic test bill documents for development and testing. Activates when user asks to seed the database, add test data, or populate bills for the dashboard.
---

# Seed MongoDB — Bill Organizer

Insert realistic test bills into the MongoDB `bill-organizer` database.

## Prerequisites
- MongoDB running (local or Atlas)
- `MONGODB_URI` set in `server/.env`
- Mongoose model defined at `server/src/models/Bill.js`

## Bill Schema
```javascript
{
  title: String,       // e.g. "March Electricity Bill"
  amount: Number,      // e.g. 45000 (in MMK)
  category: String,    // Electricity | Water | Internet | Phone | Shopping | Other
  imageUrl: String,    // placeholder URL for testing
  rawText: String,     // simulated OCR text
}
```
With `timestamps: true` — adds `createdAt` and `updatedAt` automatically.

## Seed Data

Insert these 12 test bills covering all categories:

| # | Title | Amount | Category |
|---|-------|--------|----------|
| 1 | January Electricity Bill | 25000 | Electricity |
| 2 | February Electricity Bill | 32000 | Electricity |
| 3 | March Water Bill | 8500 | Water |
| 4 | April Water Bill | 7500 | Water |
| 5 | MPT Fiber Internet (Jan) | 35000 | Internet |
| 6 | MPT Fiber Internet (Feb) | 35000 | Internet |
| 7 | Phone Top-Up (Telenor) | 5000 | Phone |
| 8 | Phone Top-Up (Ooredoo) | 10000 | Phone |
| 9 | CityMart Grocery Shopping | 45000 | Shopping |
| 10 | Junction Square Purchase | 25000 | Shopping |
| 11 | Medical Checkup Receipt | 15000 | Other |
| 12 | Bus Ticket (Yangon-Mandalay) | 25000 | Other |

Use placeholder imageUrl: `https://placehold.co/600x400?text=Bill+Receipt`

## Implementation

Write a script at `server/src/seed.js` that:
1. Imports `dotenv/config` and `mongoose`
2. Connects to `MONGODB_URI`
3. Imports the `Bill` model
4. Calls `Bill.deleteMany({})` to clear existing data
5. Calls `Bill.insertMany(seedData)` with the 12 documents above
6. Logs count and disconnects

```javascript
import 'dotenv/config';
import mongoose from 'mongoose';
import Bill from './models/Bill.js';

const bills = [
  { title: 'January Electricity Bill', amount: 25000, category: 'Electricity', imageUrl: 'https://placehold.co/600x400?text=Electricity+Bill', rawText: 'Yangon Electricity Supply Corporation...' },
  // ... all 12 entries
];

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  await Bill.deleteMany({});
  const result = await Bill.insertMany(bills);
  console.log(`Seeded ${result.length} bills`);
} catch (err) {
  console.error(err);
} finally {
  await mongoose.disconnect();
}
```

Run it: `cd server && node src/seed.js`

## Verification
- After seeding: `node -e "import 'dotenv/config'; import mongoose from 'mongoose'; import Bill from './models/Bill.js'; await mongoose.connect(process.env.MONGODB_URI); const count = await Bill.countDocuments(); console.log('Total bills:', count); const byCategory = await Bill.aggregate([{\$group: {_id: '\$category', count: {\$count: {}}}}]); console.log(byCategory); await mongoose.disconnect()"`

## Update package.json
Add to `server/package.json` scripts:
```json
"seed": "node src/seed.js"
```
