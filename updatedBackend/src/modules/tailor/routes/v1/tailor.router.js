import express from 'express';
import { tailorInitRegister, tailorRegisterVerify } from '../../controllers/register.js';
import { validateTailorRegisterInput, validateTailorVerifyInput } from '../../validators/register.js';
import { loginValidate } from '../../../../shared/validators/login.js';
import { tailorLoginController } from '../../controllers/login.js';
import upload from '../../../../middlewares/multer.middleware.js';


const tailorRouter = express.Router();


tailorRouter.post('/register/init', validateTailorRegisterInput, upload.fields([{ name: verificationphotos, maxCount: 2 }, { name: workexperiencephotos, maxCount: 10 }]), tailorInitRegister);
tailorRouter.post('/register/verify', validateTailorVerifyInput, tailorRegisterVerify);
tailorRouter.post('/login', loginValidate, tailorLoginController)


export default tailorRouter;