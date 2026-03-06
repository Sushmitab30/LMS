import { AppError } from '../../middleware/errorHandler';
import { findVideoById, findVideoNavigation, checkVideoPrerequisite } from './video.repository';

export async function getVideoDetails(videoId: string, userId: string) {
  const vid = parseInt(videoId);
  const uid = parseInt(userId);

  const video = await findVideoById(vid);

  if (!video) {
    throw new AppError(404, 'Video not found');
  }

  // Check if video is locked for this user
  const { locked, reason } = await checkVideoPrerequisite(vid, uid);

  // Get navigation
  const { previousId, nextId } = await findVideoNavigation(vid, video.section.subjectId);

  return {
    id: video.id.toString(),
    title: video.title,
    description: video.description,
    youtubeUrl: video.youtubeUrl,
    orderIndex: video.orderIndex,
    durationSeconds: video.durationSeconds,
    section: {
      id: video.section.id.toString(),
      title: video.section.title,
    },
    subject: {
      id: video.section.subject.id.toString(),
      title: video.section.subject.title,
      slug: video.section.subject.slug,
    },
    navigation: {
      previousVideoId: previousId,
      nextVideoId: nextId,
    },
    locked,
    unlockReason: reason,
  };
}

export function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
