import { signUp, signIn, signOut } from '#controllers/auth.controller.js';
import express from 'express';

const router = express.Router();

router.post('/sign-up', signUp);

import rateLimit from 'express-rate-limit';

import { authenticate } from '#middleware/auth.js';

router.post('/sign-out', authenticate, signOut);
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 sign-in attempts per windowMs
  message: 'Too many sign-in attempts, please try again later.',
});

router.post('/sign-in', signInLimiter, signIn);

router.post('/sign-out', signOut);


export default router;