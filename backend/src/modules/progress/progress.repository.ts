import { prisma } from '../../config/db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySection = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProgress = any;

export async function findSubjectProgress(subjectId: number, userId: number) {
  // Get all videos in the subject
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        include: {
          videos: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!subject) return null;

  const videoIds = subject.sections.flatMap((s: AnySection) => s.videos.map((v: { id: number }) => v.id));

  // Get progress for all videos
  const progress = await prisma.videoProgress.findMany({
    where: {
      userId,
      videoId: { in: videoIds },
    },
    select: {
      videoId: true,
      isCompleted: true,
      lastPositionSeconds: true,
      updatedAt: true,
    },
  });

  const completedVideos = progress.filter((p: AnyProgress) => p.isCompleted).length;
  const totalVideos = videoIds.length;
  const percentComplete = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  // Find the last watched video (most recently updated)
  const lastProgress = progress.length > 0
    ? progress.reduce((latest: AnyProgress, current: AnyProgress) => 
        current.updatedAt > latest.updatedAt ? current : latest
      )
    : null;

  return {
    totalVideos,
    completedVideos,
    percentComplete,
    lastVideoId: lastProgress?.videoId.toString() || null,
    lastPositionSeconds: lastProgress?.lastPositionSeconds || 0,
  };
}

export async function findVideoProgress(videoId: number, userId: number) {
  return prisma.videoProgress.findUnique({
    where: {
      userId_videoId: {
        userId,
        videoId,
      },
    },
  });
}

export async function upsertVideoProgress(
  videoId: number,
  userId: number,
  data: {
    lastPositionSeconds: number;
    isCompleted?: boolean;
  }
) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { durationSeconds: true },
  });

  // Validate position doesn't exceed duration
  let position = data.lastPositionSeconds;
  if (video?.durationSeconds && position > video.durationSeconds) {
    position = video.durationSeconds;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    lastPositionSeconds: position,
  };

  if (data.isCompleted !== undefined) {
    updateData.isCompleted = data.isCompleted;
    if (data.isCompleted) {
      updateData.completedAt = new Date();
    }
  }

  return prisma.videoProgress.upsert({
    where: {
      userId_videoId: {
        userId,
        videoId,
      },
    },
    update: updateData,
    create: {
      userId,
      videoId,
      lastPositionSeconds: position,
      isCompleted: data.isCompleted || false,
      completedAt: data.isCompleted ? new Date() : null,
    },
  });
}
