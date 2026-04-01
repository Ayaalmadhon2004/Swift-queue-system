import express from 'express';
import { register, login , getMe } from '../controllers/authController.js';
import {protect} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me',protect,getMe);

// what is the difference between router.post and router.push here ? ? and why in get we use 2 params also protect,getMe?

export default router;