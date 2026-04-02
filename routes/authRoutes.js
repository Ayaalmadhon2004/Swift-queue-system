import express from 'express';
import { register, login , getMe, changePassword } from '../controllers/authController.js';
import {protect} from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Register a new user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name: {type: string}
 * email: {type: string}
 * password: {type: string}
 * responses:
 * 201:
 * description: User created successfully
 */

router.post('/register', register);
router.post('/login', login);

router.get('/me',protect,getMe);
router.put('/me',protect,updateMe);

router.put('/change-password',protect,changePassword)

export default router;