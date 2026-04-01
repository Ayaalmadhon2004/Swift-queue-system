import express from 'express';
import { register, login , getMe, changePassword } from '../controllers/authController.js';
import {protect} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me',protect,getMe);
router.put('/me',protect,updateMe);

router.put('/change-password',protect,changePassword)

// what is the difference between router.post and router.push and router.put here ? ? and why in get we use 2 params also protect,getMe?
// why i put protect with getMe and updateMe and not use it in register and login
// why i am using alot of routs not just the main ones , i had a conflict between this way and front yet !
export default router;