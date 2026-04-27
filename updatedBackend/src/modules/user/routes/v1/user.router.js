import express from 'express';
import { userRegisterInitController, userRegisterVerifyController } from '../../controllers/register.js'
import { validateUserRegisterInput, validateUserVerifyInput } from '../../validators/register.js'

const userRouter = express.Router();

userRouter.post('/register/init', validateUserRegisterInput, userRegisterInitController)
userRouter.post('/register/verify', validateUserVerifyInput, userRegisterVerifyController)


export default userRouter;