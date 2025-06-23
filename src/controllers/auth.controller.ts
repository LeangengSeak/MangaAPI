import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthService } from "../services/auth.service";
import { HTTPSTATUS } from "../config/http.config";
import { UserService } from "../services/user.service";

import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifictaionEmailSchema,
} from "../shared/validators/auth.validator";

import {
  NotFoundExpection,
  UnauthorizedException,
} from "../shared/utils/catch-errors";

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    this.authService = authService;
    this.userService = userService;
  }

  public register = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = registerSchema.parse({ ...req.body });
      const { user } = await this.authService.register(body);

      return res.status(HTTPSTATUS.CREATED).json({
        message: "User registered successfully",
        data: user,
      });
    }
  );

  public login = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userAgent = req.headers["user-agent"];
      const body = loginSchema.parse({ ...req.body, userAgent });

      const { user, accessToken, refreshToken, mfaRequired } =
        await this.authService.login(body);

      if (mfaRequired)
        return res.status(HTTPSTATUS.OK).json({
          message: "Verify MFA authentication",
          hint: "requireMfa",
          data: {
            mfaRequired,
            user,
          },
        });

      if (!accessToken || !refreshToken)
        return res.status(HTTPSTATUS.UNAUTHORIZED).json({
          message: "Invalid credentials",
        });

      return res.status(HTTPSTATUS.OK).json({
        message: "User logged in successfully",
        mfaRequired,
        data: {
          user,
          tokens: { accessToken, refreshToken },
        },
      });
    }
  );

  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const refreshToken = req.headers["x-refresh-token"] as string | undefined;

      if (!refreshToken)
        throw new UnauthorizedException("Refresh token is missing");

      const { accessToken, newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      return res.status(HTTPSTATUS.OK).json({
        message: "Tokens refreshed successfully",
        hint: "rotate",
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
          },
        },
      });
    }
  );

  public verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { code } = verifictaionEmailSchema.parse(req.body);

      await this.authService.verifyEmail(code);

      return res.status(HTTPSTATUS.OK).json({
        message: "Email verified successfully",
      });
    }
  );

  public resendVerification = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const email = emailSchema.parse(req.body.email);
      
      await this.authService.resendVerification(email)

      return res.status(HTTPSTATUS.OK).json({
        message: "Verification email sent successfully",
      });
      
    }
  );

  public forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const email = emailSchema.parse(req.body.email);

      await this.authService.forgotPassword(email);

      return res.status(HTTPSTATUS.OK).json({
        message: "Password reset link sent to your email",
      });
    }
  );

  public resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = resetPasswordSchema.parse(req.body);

      await this.authService.resetPassword(body);

      return res.status(HTTPSTATUS.OK).json({
        message: "Reset Password successfully",
        hint: "clearTokens",
      });
    }
  );

  public logout = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req.sessionId;

      if (!sessionId) throw new NotFoundExpection("Session is invalid.");

      await this.authService.logout(sessionId);

      return res.status(HTTPSTATUS.OK).json({
        message: "User logout successfully",
        hint: "clearTokens",
      });
    }
  );

  public getMe = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userId = req.user?.id;

      if (!userId) throw new NotFoundExpection("User not found");
      
      const user = await this.userService.getUserById(userId);

      return res.status(HTTPSTATUS.OK).json({
        message: "User retrieved successfully",
        data: user,
      });
    }
  );
}
