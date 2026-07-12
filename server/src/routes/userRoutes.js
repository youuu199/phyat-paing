import { Router } from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  changePassword,
  updateSettings,
  getStats,
  getRates,
} from '../controllers/userController.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// All routes require authentication
router.use(auth);

// Profile
router.get('/me', getProfile);
router.patch('/profile', updateProfile);

// Avatar
router.patch('/avatar', upload.single('avatar'), updateAvatar);
router.delete('/avatar', deleteAvatar);

// Password
router.patch('/password', changePassword);

// Settings
router.patch('/settings', updateSettings);

// Stats
router.get('/stats', getStats);

// Live exchange rates
router.get('/rates', getRates);

export default router;
