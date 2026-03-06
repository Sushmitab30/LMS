import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getVideoDetails, extractYoutubeVideoId } from './video.service';
import { AppError } from '../../middleware/errorHandler';

const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function getVideo(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = paramsSchema.parse(req.params);
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    const video = await getVideoDetails(id, userId);

    // Extract YouTube video ID for embed
    const youtubeVideoId = extractYoutubeVideoId(video.youtubeUrl);

    res.json({
      status: 'success',
      data: {
        video: {
          ...video,
          youtubeVideoId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
