import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { AuthService } from '../services/auth.service';
import { HTTPSTATUS } from '../config/http.config';
import { registerSchema } from '../shared/validators/auth.validator';

export class AuthController {
    constructor(private authService: AuthService) {
        this.authService = authService;
    }

    public register = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const body = registerSchema.parse({ ...req.body })
        const { user } = await this.authService.register(body);
        return res.status(HTTPSTATUS.CREATED).json({
            message: "User registered successfully",
            data: user
        })
         
    })
}