import express from 'express';
import { refreshTokenController } from '../controllers/RefreshToken.Controller.js';

const authRouter = express.Router();

authRouter.get('/refresh' , refreshTokenController);


export default authRouter;