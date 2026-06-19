import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

const CATEGORIES = ['Electricity', 'Water', 'Internet', 'Phone', 'Shopping', 'Other'];
const bills = [
  { _id: '1', title: 'March Electricity Bill', amount: 25000, category: 'Electricity', imageUrl: 'https://placehold.co/600x400/fbbf24/1f2937?text=Electricity+Bill', cloudinaryPublicId: '', createdAt: '2025-03-15T00:00:00.000Z' },
  { _id: '2', title: 'February Water Bill', amount: 8500, category: 'Water', imageUrl: 'https://placehold.co/600x400/38bdf8/1f2937?text=Water+Bill', cloudinaryPublicId: '', createdAt: '2025-02-10T00:00:00.000Z' },
  { _id: '3', title: 'MPT Fiber Internet (Jan)', amount: 35000, category: 'Internet', imageUrl: 'https://placehold.co/600x400/a78bfa/1f2937?text=Internet+Bill', cloudinaryPublicId: '', createdAt: '2025-01-28T00:00:00.000Z' },
  { _id: '4', title: 'Phone Top-Up (Telenor)', amount: 5000, category: 'Phone', imageUrl: 'https://placehold.co/600x400/34d399/1f2937?text=Phone+TopUp', cloudinaryPublicId: '', createdAt: '2025-03-05T00:00:00.000Z' },
  { _id: '5', title: 'CityMart Grocery', amount: 45000, category: 'Shopping', imageUrl: 'https://placehold.co/600x400/f472b6/1f2937?text=Shopping+Receipt', cloudinaryPublicId: '', createdAt: '2025-03-12T00:00:00.000Z' },
  { _id: '6', title: 'Medical Checkup', amount: 15000, category: 'Other', imageUrl: 'https://placehold.co/600x400/9ca3af/1f2937?text=Medical+Receipt', cloudinaryPublicId: '', createdAt: '2025-01-20T00:00:00.000Z' },
];
let nextId = 7;

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.get('/api/bills', (req, res) => {
  let result = [...bills];
  const cat = req.query.category;
  if (cat && cat !== 'All') result = result.filter((b) => b.category === cat);

  const { year, month } = req.query;
  if (year) {
    result = result.filter((b) => {
      const d = new Date(b.createdAt);
      if (month) return d.getFullYear() === +year && d.getMonth() + 1 === +month;
      return d.getFullYear() === +year;
    });
  }

  res.json(result);
});

app.get('/api/bills/months', (_req, res) => {
  const months = {};
  const MONTH_LABELS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  for (const b of bills) {
    const d = new Date(b.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    months[key] = (months[key] || 0) + 1;
  }
  const result = Object.entries(months)
    .map(([k, count]) => {
      const [year, month] = k.split('-').map(Number);
      return { year, month, label: `${MONTH_LABELS[month - 1]} ${year}`, count };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
  res.json(result);
});

app.post('/api/bills', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided. Use field name "image".' });
  }
  const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const bill = {
    _id: String(nextId++),
    title: req.file.originalname.replace(/\.[^.]+$/, '') + ' Bill',
    amount: Math.floor(Math.random() * 50000) + 1000,
    category: cat,
    imageUrl: `https://placehold.co/600x400/fbbf24/1f2937?text=${encodeURIComponent(req.file.originalname)}`,
    cloudinaryPublicId: `bill-organizer/stub_${nextId - 1}`,
    createdAt: new Date().toISOString(),
  };
  bills.unshift(bill);
  res.status(201).json(bill);
});

app.delete('/api/bills/:id', (req, res) => {
  const idx = bills.findIndex((b) => b._id === req.params.id);
  if (idx >= 0) bills.splice(idx, 1);
  res.json({ message: 'Deleted', id: req.params.id });
});

app.listen(5000, () => console.log('stub ready on :5000'));
