import { config } from "../config/app.config";
import { sendEmail } from "../mailers/mailer";
import { verifyEmailTemplate } from "../mailers/templates/template";
import UserModel from "../models/user.model";
import verificationCodeModel from "../models/verification.model";
import { VerificationEum } from "../shared/enums/verification-code.enum";
import { RegisterDto } from "../shared/interfaces/auth.interface";
import { fortyFiveMinutesFromNow } from "../shared/utils/date-time";

export class AuthService {
  public async register(registerData: RegisterDto) {
    const { firstName, lastName, email, password } = registerData;

    const exitingUser = await UserModel.exists({ email });

    if (exitingUser) {
      console.log(`User with email ${email} already exists`);
      throw new Error(`User with email ${email} already exists`);
    }

    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password, // Password will be hashed in the pre-save hook
    });

    const userId = newUser._id;

    const verification = await verificationCodeModel.create({
      userId,
      type: VerificationEum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    // Sending verification email link
    const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });
    return { user: newUser };
  }
}
