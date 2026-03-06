import { AppError } from '../../middleware/errorHandler';
import {
  findSubjectProgress,
  findVideoProgress,
  upsertVideoProgress,
} from './progress.repository';

export async function getSubjectProgress(subjectId: string, userId: string) {
  const sid = parseInt(subjectId);
  const uid = parseInt(userId);

  const progress = await findSubjectProgress(sid, uid);

  if (!progress) {
    throw new AppError(404, 'Subject not found');
  }

  return progress;
}

export async function getVideoProgress(videoId: string, userId: string) {
  const vid = parseInt(videoId);
  const uid = parseInt(userId);

  const progress = await findVideoProgress(vid, uid);

  return {
    lastPositionSeconds: progress?.lastPositionSeconds || 0,
    isCompleted: progress?.isCompleted || false,
    completedAt: progress?.completedAt || null,
  };
}

export async function updateVideoProgress(
  videoId: string,
  userId: string,
  data: {
    lastPositionSeconds: number;
    isCompleted?: boolean;
  }
) {
  const vid = parseInt(videoId);
  const uid = parseInt(userId);

  // Validate position is non-negative
  if (data.lastPositionSeconds < 0) {
    throw new AppError(400, 'Position cannot be negative');
  }

  const progress = await upsertVideoProgress(vid, uid, data);

  return {
    lastPositionSeconds: progress.lastPositionSeconds,
    isCompleted: progress.isCompleted,
    completedAt: progress.completedAt,
  };
}
