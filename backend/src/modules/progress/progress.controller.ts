import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getSubjectProgress,
  getVideoProgress,
  updateVideoProgress,
} from './progress.service';
import { AppError } from '../../middleware/errorHandler';

const paramsSchema = z.object({
  id: z.string().min(1),
});

const updateProgressSchema = z.object({
  lastPositionSeconds: z.number().int().min(0),
  isCompleted: z.boolean().optional(),
});

export async function getSubjectProgressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = paramsSchema.parse(req.params);
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    const progress = await getSubjectProgress(id, userId);

    res.json({
      status: 'success',
      data: { progress },
    });
  } catch (error) {
    next(error);
  }
}

export async function getVideoProgressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = paramsSchema.parse(req.params);
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    const progress = await getVideoProgress(id, userId);

    res.json({
      status: 'success',
      data: { progress },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVideoProgressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = paramsSchema.parse(req.params);
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    const data = updateProgressSchema.parse(req.body);
    const progress = await updateVideoProgress(id, userId, data);

    res.json({
      status: 'success',
      data: { progress },
    });
  } catch (error) {
    next(error);
  }
}
