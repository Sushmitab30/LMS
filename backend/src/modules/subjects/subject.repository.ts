import { prisma } from '../../config/db';

// Define types locally to avoid Prisma client dependency issues
type SectionType = {
  id: number;
  subjectId: number;
  title: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
};

type VideoType = {
  id: number;
  sectionId: number;
  title: string;
  description: string | null;
  youtubeUrl: string;
  orderIndex: number;
  durationSeconds: number;
  createdAt: Date;
  updatedAt: Date;
};

type SectionWithVideos = SectionType & { videos: VideoType[] };
type VideoProgressItem = { videoId: number; isCompleted: boolean };

export async function findAllPublishedSubjects(page: number, pageSize: number, search?: string) {
  const where = {
    isPublished: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        createdAt: true,
      },
    }),
    prisma.subject.count({ where }),
  ]);

  return {
    subjects: subjects.map((s: { id: number; title: string; slug: string; description: string | null; thumbnail: string | null; createdAt: Date }) => ({
      ...s,
      id: s.id.toString(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findSubjectById(id: number) {
  return prisma.subject.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnail: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findSubjectBySlug(slug: string) {
  return prisma.subject.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnail: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findSubjectTree(subjectId: number, userId?: number) {
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
              title: true,
              orderIndex: true,
              durationSeconds: true,
            },
          },
        },
      },
    },
  });

  if (!subject) return null;

  // Get user's progress for all videos if userId provided
  let progressMap: Map<string, boolean> = new Map();
  if (userId) {
    const videoIds = subject.sections.flatMap((s: SectionWithVideos) => s.videos.map((v: VideoType) => v.id));
    const progress = await prisma.videoProgress.findMany({
      where: {
        userId,
        videoId: { in: videoIds },
      },
      select: {
        videoId: true,
        isCompleted: true,
      },
    });
    progressMap = new Map(progress.map((p: VideoProgressItem) => [p.videoId.toString(), p.isCompleted]));
  }

  // Flatten all videos to calculate locked status
  const allVideos: { id: string; sectionId: string; orderIndex: number }[] = [];
  subject.sections.forEach((section: SectionWithVideos) => {
    section.videos.forEach((video: VideoType) => {
      allVideos.push({
        id: video.id.toString(),
        sectionId: section.id.toString(),
        orderIndex: video.orderIndex,
      });
    });
  });

  // Sort by section order, then video order
  allVideos.sort((a, b) => {
    const sectionA = subject.sections.find((s: SectionWithVideos) => s.id.toString() === a.sectionId)!;
    const sectionB = subject.sections.find((s: SectionWithVideos) => s.id.toString() === b.sectionId)!;
    if (sectionA.orderIndex !== sectionB.orderIndex) {
      return sectionA.orderIndex - sectionB.orderIndex;
    }
    return a.orderIndex - b.orderIndex;
  });

  // Calculate locked status for each video
  const lockedMap = new Map<string, boolean>();
  allVideos.forEach((video, index) => {
    if (index === 0) {
      lockedMap.set(video.id, false);
    } else {
      const prevVideoId = allVideos[index - 1].id;
      const isPrevCompleted = progressMap.get(prevVideoId) || false;
      lockedMap.set(video.id, !isPrevCompleted);
    }
  });

  return {
    id: subject.id.toString(),
    title: subject.title,
    slug: subject.slug,
    description: subject.description,
    thumbnail: subject.thumbnail,
    sections: subject.sections.map((section: SectionWithVideos) => ({
      id: section.id.toString(),
      title: section.title,
      orderIndex: section.orderIndex,
      videos: section.videos.map((video: VideoType) => ({
        id: video.id.toString(),
        title: video.title,
        orderIndex: video.orderIndex,
        durationSeconds: video.durationSeconds,
        isCompleted: progressMap.get(video.id.toString()) || false,
        locked: lockedMap.get(video.id.toString()) || false,
      })),
    })),
  };
}

export async function findFirstVideoInSubject(subjectId: number) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' },
        take: 1,
        include: {
          videos: {
            orderBy: { orderIndex: 'asc' },
            take: 1,
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!subject || subject.sections.length === 0 || subject.sections[0].videos.length === 0) {
    return null;
  }

  return subject.sections[0].videos[0].id.toString();
}
