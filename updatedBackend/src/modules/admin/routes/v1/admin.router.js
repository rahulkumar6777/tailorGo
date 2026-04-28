import express from 'express';
import { tailorAdminVerifyController } from '../../controllers/tailorVerification.js';

const adminRouter = express.Router();

adminRouter.get('/tailor/verify/:token', tailorAdminVerifyController);

export default adminRouter;
