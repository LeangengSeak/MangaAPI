import { config } from "../config/app.config";
import { sendEmail } from "../mailers/mailer";
import {
  passwordResetTemplate,
  verifyEmailTemplate,
} from "../mailers/templates/template";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import verificationCodeModel from "../models/verification.model";
import { ErrorCode } from "../shared/enums/error-code.enum";
import { VerificationEum } from "../shared/enums/verification-code.enum";
import {
  LoginDto,
  RegisterDto,
  resetPasswordDto,
} from "../shared/interfaces/auth.interface";
import { hashValue } from "../shared/utils/bcrypt";
import {
  BadRequestException,
  InternalServerExecption,
  NotFoundException,
  UnauthorizedException,
} from "../shared/utils/catch-errors";
import {
  anHourFromNow,
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
  oneMinuteAgo,
  threeMinutesAgo,
} from "../shared/utils/date-time";
import {
  refreshTokenSignOptions,
  RefreshTPayload,
  signJwtToken,
  verifyJwtToken,
} from "../shared/utils/jwt";
import { logger } from "../shared/utils/logger";

export class AuthService {
  private async sendEmailVerification(userId: string, email: string) {
    const timeAgo = oneMinuteAgo();
    const maxAttempts = 1;

    const count = await verificationCodeModel.countDocuments({
      userId,
      type: VerificationEum.EMAIL_VERIFICATION,
      createdAt: { $gt: timeAgo },
    });

    if (count >= maxAttempts)
      throw new BadRequestException(
        "Too many requests, please try again later in 1 minute",
        ErrorCode.AUTH_TOO_MANY_ATTEMPS
      );

    const verification = await verificationCodeModel.create({
      userId,
      type: VerificationEum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });
    const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;

    try {
      const result = await sendEmail({
        to: email,
        ...verifyEmailTemplate(verificationUrl),
      });

      if (!result.messageId) {
        throw new InternalServerExecption(
          `Failed to send verification email to ${email}`
        );
      }

      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error("Error sending verification email:", error);
      throw new InternalServerExecption("Could not send verification email.");
    }
  }

  public async register(registerData: RegisterDto) {
    const { firstName, lastName, email, password } = registerData;

    const exitingUser = await UserModel.exists({ email });

    if (exitingUser) {
      throw new BadRequestException(
        "User with this email already exists",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const newUser = await UserModel.create({
      firstName,
      lastName,
      email,
      password,
    });

    await this.sendEmailVerification(newUser.id, newUser.email);

    return { user: newUser };
  }

  public async login(loginData: LoginDto) {
    const { email, password, userAgent } = loginData;

    const user = await UserModel.findOne({ email });

    if (!user) {
      logger.warn(`Login failed User with email ${email} not found`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login failed for user ${email}: Invalid password`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_NOT_FOUND
      );
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException(
        "Email is not verified",
        ErrorCode.AUTH_EMAIL_NOT_VERIFIED
      );
    }

    // check if the user enable 2fa return user = null
    if (user.userPreferences.enable2FA) {
      logger.info(`2FA is enabled for user Id : ${user._id}`);
      return {
        user: null,
        mfaRequired: true,
        accessToken: null,
        refreshToken: null,
      };
    }

    logger.info(`Creating session for user ID : ${user._id}`);
    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    });

    logger.info(
      `Session created for user ID : ${user._id}, Session ID : ${session._id}`
    );
    const accessToken = signJwtToken({
      userId: user._id,
      sessionId: session._id,
    });

    const refreshToken = signJwtToken(
      { sessionId: session._id },
      refreshTokenSignOptions
    );

    logger.info(`Login successful for user ID : ${user._id}`);
    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async refreshToken(refreshToken: string) {
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    });

    if (!payload) throw new UnauthorizedException("Invalid refresh token");

    const session = await SessionModel.findById(payload.sessionId);
    const now = Date.now();

    if (!session) throw new UnauthorizedException("Session not found");

    if (session.expiredAt.getTime() < now)
      throw new UnauthorizedException("Session expired");

    const sessionRequireRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequireRefresh) {
      session.expiredAt = calculateExpirationDate(
        config.JWT.REFRESH_EXPIRES_IN
      );
      await session.save();
    }

    const newRefreshToken = sessionRequireRefresh
      ? signJwtToken({ sessionId: session._id }, refreshTokenSignOptions)
      : undefined;

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session._id,
    });

    return { accessToken, newRefreshToken };
  }

  public async verifyEmail(code: string) {
    const validCode = await verificationCodeModel.findOne({
      code,
      type: VerificationEum.EMAIL_VERIFICATION,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode)
      throw new BadRequestException("Invalid or expired verification code");

    const updatedUser = await UserModel.findByIdAndUpdate(
      validCode.userId,
      {
        isEmailVerified: true,
      },
      { new: true }
    );

    if (!updatedUser)
      throw new BadRequestException(
        "Unable to verify email",
        ErrorCode.VALIDATION_ERROR
      );

    await validCode.deleteOne();
    return {
      message: "Email verified successfully",
      data: { updatedUser },
    };
  }

  public async resendVerification(email: string) {
    const user = await UserModel.findOne({ email });

    if (!user) throw new BadRequestException("user not found");

    if (user.isEmailVerified) {
      throw new BadRequestException(
        "Email is already verified",
        ErrorCode.AUTH_EMAIL_VERIFIED
      );
    }

    await this.sendEmailVerification(user.id, user.email);
  }

  public async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });

    if (!user) throw new BadRequestException("user not found");

    const timeAgo = threeMinutesAgo();
    const maxAttempts = 5;

    const count = await verificationCodeModel.countDocuments({
      userId: user._id,
      type: VerificationEum.PASSWORD_RESET,
      createdAt: { $gt: timeAgo },
    });

    if (count >= maxAttempts)
      throw new BadRequestException(
        "Too many requests, please try again later",
        ErrorCode.AUTH_TOO_MANY_ATTEMPS
      );

    const expiresAt = anHourFromNow();
    const validCode = await verificationCodeModel.create({
      userId: user._id,
      type: VerificationEum.PASSWORD_RESET,
      expiresAt,
    });

    const resetLink = `${config.APP_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;

    const result = await sendEmail({
      to: user.email,
      ...passwordResetTemplate(resetLink),
    });

    if (!result.messageId)
      throw new InternalServerExecption(`Failed to send email`);

    return {
      url: resetLink,
      message: "Password reset email sent successfully",
      emailId: result.messageId,
    };
  }

  public async resetPassword({ password, verificationCode }: resetPasswordDto) {
    const validCode = await verificationCodeModel.findOne({
      code: verificationCode,
      type: VerificationEum.PASSWORD_RESET,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode)
      throw new NotFoundException("Invalid or expired verification code");

    const hashedPassword = await hashValue(password);

    const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
      password: hashedPassword,
    });

    if (!updatedUser) throw new BadRequestException("Failed to reset password");

    await validCode.deleteOne();

    await SessionModel.deleteMany({
      userId: updatedUser._id,
    });

    return {
      user: updatedUser,
    };
  }

  public async logout(sessionId: string): Promise<any> {
    if (!sessionId)
      throw new BadRequestException("Session ID is required for logout");

    return await SessionModel.findByIdAndDelete(sessionId);
  }
}
