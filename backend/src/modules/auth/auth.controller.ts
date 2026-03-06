import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, refreshAccessToken, revokeRefreshToken } from './auth.service';
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from '../../config/security';
import { AppError } from '../../middleware/errorHandler';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerUser(req.body);
    
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
    
    res.status(201).json({
      status: 'success',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser(req.body);
    
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
    
    res.json({
      status: 'success',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    
    if (!refreshToken) {
      throw new AppError(401, 'Refresh token required');
    }

    const result = await refreshAccessToken(refreshToken);
    
    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    
    if (refreshToken && req.user) {
      await revokeRefreshToken(refreshToken, req.user.userId);
    }
    
    res.clearCookie(REFRESH_COOKIE_NAME, {
      ...refreshCookieOptions,
      maxAge: 0,
    });
    
    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }
    
    res.json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}
