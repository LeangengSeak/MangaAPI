import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthService } from "../services/auth.service";
import { HTTPSTATUS } from "../config/http.config";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifictaionEmailSchema,
} from "../shared/validators/auth.validator";
import {
  getRefreshTokenCookieOptions,
  setAuthenticationCookies,
} from "../shared/utils/cookie";
import {
  NotFoundExpection,
  UnauthorizedException,
} from "../shared/utils/catch-errors";

export class AuthController {
  constructor(private authService: AuthService) {
    this.authService = authService;
  }

  public register = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      console.log("Register body", req.body);
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
          data: {
            mfaRequired,
            user,
          },
        });
      if (!accessToken || !refreshToken)
        return res.status(HTTPSTATUS.UNAUTHORIZED).json({
          message: "Invalid credentials",
        });
      return setAuthenticationCookies({
        res,
        accessToken,
        refreshToken,
      })
        .status(HTTPSTATUS.OK)
        .json({
          message: "User logged in successfully",
          mfaRequired,
          data: {
            user,
            accessToken,
            refreshToken,
          },
        });
    }
  );

  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const refreshToken = req.cookies.refreshToken as string | undefined;
      if (!refreshToken)
        throw new UnauthorizedException("Refresh token is missing");

      const { accessToken, newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      if (newRefreshToken)
        res.cookie(
          "refreshToken",
          newRefreshToken,
          getRefreshTokenCookieOptions()
        );

      return res
        .status(HTTPSTATUS.OK)
        .cookie("accessToken", accessToken, getRefreshTokenCookieOptions())
        .json({
          message: "Tokens refreshed successfully",
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
        message: "Password reset successfully",
      });
    }
  );

  public logout = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req.sessionId;
      if (!sessionId) throw new NotFoundExpection("Session is invalid.");

      await this.authService.logout(sessionId)

      return res.status(HTTPSTATUS.OK).json({
        message: "User logged out successfully",
      });
    }
  );
}
