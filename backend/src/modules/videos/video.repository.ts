import { prisma } from '../../config/db';

export async function findVideoById(videoId: number) {
  return prisma.video.findUnique({
    where: { id: videoId },
    include: {
      section: {
        include: {
          subject: true,
        },
      },
    },
  });
}

export async function findVideoNavigation(videoId: number, subjectId: number) {
  // Get all videos in the subject ordered by section order, then video order
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
          videos: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!subject) return { previousId: null, nextId: null };

  // Flatten videos in order
  const videoIds: number[] = [];
  for (const section of subject.sections) {
    for (const video of section.videos) {
      videoIds.push(video.id);
    }
  }

  const currentIndex = videoIds.findIndex(id => id === videoId);
  
  if (currentIndex === -1) return { previousId: null, nextId: null };

  const previousId = currentIndex > 0 ? videoIds[currentIndex - 1].toString() : null;
  const nextId = currentIndex < videoIds.length - 1 ? videoIds[currentIndex + 1].toString() : null;

  return { previousId, nextId };
}

export async function checkVideoPrerequisite(videoId: number, userId: number) {
  // Get the subject and all videos
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      section: {
        include: {
          subject: {
            include: {
              sections: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  videos: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!video) return { locked: true, reason: 'Video not found' };

  // Flatten videos in order
  const videoIds: number[] = [];
  for (const section of video.section.subject.sections) {
    for (const v of section.videos) {
      videoIds.push(v.id);
    }
  }

  const currentIndex = videoIds.findIndex(id => id === videoId);
  
  // First video is always unlocked
  if (currentIndex === 0) {
    return { locked: false, reason: null };
  }

  // Check if previous video is completed
  const previousVideoId = videoIds[currentIndex - 1];
  const progress = await prisma.videoProgress.findUnique({
    where: {
      userId_videoId: {
        userId,
        videoId: previousVideoId,
      },
    },
  });

  if (progress?.isCompleted) {
    return { locked: false, reason: null };
  }

  return { locked: true, reason: 'Complete the previous video to unlock' };
}
