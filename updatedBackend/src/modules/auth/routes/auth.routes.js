import express from 'express';
import { refreshTokenController } from '../controllers/RefreshToken.Controller.js';
import { logoutController } from '../controllers/logout.controller.js';

const authRouter = express.Router();

authRouter.get('/refresh' , refreshTokenController);
authRouter.post('/logout', logoutController);


export default authRouter;
