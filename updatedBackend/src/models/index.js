import { Review } from "../modules/tailor/models/review.js";
import { Tailor } from "../modules/tailor/models/tailor.js";
import { User } from "../modules/user/models/user.js";
import { Order } from "../modules/booking/models/order.js";
import { OtpValidate } from "../shared/models/otpValidator.js";
import { Referral } from "../shared/models/refreral.js";

export const model = {
  User,
  Tailor,
  Order,
  OtpValidate,
  Referral,
  Review
};
