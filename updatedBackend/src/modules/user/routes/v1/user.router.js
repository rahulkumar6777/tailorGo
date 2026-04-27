import express from 'express';
import { userRegisterInitController, userRegisterVerifyController } from '../../controllers/register.js'
import { validateUserRegisterInput, validateUserVerifyInput } from '../../validators/register.js'
import { loginValidate } from '../../../../shared/validators/login.js';
import { loginController } from '../../controllers/login.js';

const userRouter = express.Router();

userRouter.post('/register/init', validateUserRegisterInput, userRegisterInitController);
userRouter.post('/register/verify', validateUserVerifyInput, userRegisterVerifyController);
userRouter.post('/login' , loginValidate , loginController)


export default userRouter;