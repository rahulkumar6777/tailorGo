import express from 'express';
import adminRouter from '../modules/admin/routes/v1/admin.router.js';
import tailorRouter from '../modules/tailor/routes/v1/tailor.router.js';
import userRouter from '../modules/user/routes/v1/user.router.js';

const indexRouter = express.Router();

indexRouter.use('/v1/admin', adminRouter);
indexRouter.use('/v1/tailor', tailorRouter);
indexRouter.use('/v1/user', userRouter);

export default indexRouter;
