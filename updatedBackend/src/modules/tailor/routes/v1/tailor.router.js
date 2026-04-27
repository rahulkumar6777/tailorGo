import express from 'express';
import { tailorInitRegister, tailorRegisterVerify } from '../../controllers/register.js';
import { validateTailorRegisterInput, validateTailorVerifyInput } from '../../validators/register.js';
const tailorRouter = express.Router();


tailorRouter.post('/register/init', validateTailorRegisterInput, tailorInitRegister);
tailorRouter.post('/register/verify' ,validateTailorVerifyInput , tailorRegisterVerify )

export default tailorRouter;