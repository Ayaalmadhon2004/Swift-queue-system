import express from 'express';
import { register, login , getMe } from '../controllers/authController.js';
import {protect} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me',protect,getMe);
router.put('/me',protect,updateMe);

// what is the difference between router.post and router.push and router.put here ? ? and why in get we use 2 params also protect,getMe?
// why i put protect with getMe and updateMe and not use it in register and login
export default router;