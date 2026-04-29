import express from 'express';
import { tailorInitRegister, tailorRegisterVerify } from '../../controllers/register.js';
import { validateTailorRegisterInput, validateTailorVerifyInput } from '../../validators/register.js';
import { loginValidate } from '../../../../shared/validators/login.js';
import { tailorLoginController } from '../../controllers/login.js';
import upload from '../../../../middlewares/multer.middleware.js';
import { tailorProfile } from '../../services/profile.seervice.js';
import { tailorProfileControllers } from '../../controllers/profile.js';
import { getNearbyTailorsController } from '../../controllers/getNearbyTailors.js';
import { validateNearbyTailors } from '../../validators/getNearbyTailors.js';


const tailorRouter = express.Router();


tailorRouter.post('/register/init', upload.fields([{ name: 'verificationPhotos', maxCount: 2 }, { name: 'workExperiencePhotos', maxCount: 10 }]), validateTailorRegisterInput, tailorInitRegister);
tailorRouter.post('/register/verify', validateTailorVerifyInput, tailorRegisterVerify);
tailorRouter.post('/login', loginValidate, tailorLoginController)
tailorRouter.get('/profile/:username', tailorProfileControllers)
tailorRouter.get('/nearby', validateNearbyTailors, getNearbyTailorsController)

export default tailorRouter;
