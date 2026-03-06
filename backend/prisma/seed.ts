import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Define 6 separate courses with their YouTube videos
  const courses = [
    {
      title: 'Python Full Course for Beginners',
      slug: 'python-beginners',
      description: 'Learn Python programming from scratch. This comprehensive course covers all the basics you need to start coding in Python.',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
      videoTitle: 'Python Complete Course',
      videoDescription: 'Complete Python tutorial for absolute beginners.',
      youtubeUrl: 'https://youtu.be/UrsmFxEIp5k',
    },
    {
      title: 'JavaScript Complete Course',
      slug: 'javascript-complete',
      description: 'Master JavaScript from fundamentals to advanced concepts. Perfect for beginners and intermediate developers.',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
      videoTitle: 'JavaScript Full Course',
      videoDescription: 'Complete JavaScript tutorial covering all essential topics.',
      youtubeUrl: 'https://youtu.be/rV_3Lewxx6o',
    },
    {
      title: 'React JS Tutorial for Beginners',
      slug: 'react-beginners',
      description: 'Learn React JS from scratch and build modern web applications with this popular JavaScript library.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      videoTitle: 'React JS Complete Course',
      videoDescription: 'Build modern web applications with React JS.',
      youtubeUrl: 'https://youtu.be/BsDoLVMnmZs',
    },
    {
      title: 'Node.js Complete Guide',
      slug: 'nodejs-guide',
      description: 'Learn Node.js and build scalable server-side applications with JavaScript.',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      videoTitle: 'Node.js Full Course',
      videoDescription: 'Complete Node.js tutorial for backend development.',
      youtubeUrl: 'https://youtu.be/F4zr1aMevB4',
    },
    {
      title: 'HTML and CSS Full Course',
      slug: 'html-css-course',
      description: 'Learn HTML and CSS fundamentals to create beautiful, responsive websites from scratch.',
      thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
      videoTitle: 'HTML CSS Complete Course',
      videoDescription: 'Master web design with HTML and CSS.',
      youtubeUrl: 'https://youtu.be/G3e-cpL7ofc',
    },
    {
      title: 'SQL Database Masterclass',
      slug: 'sql-masterclass',
      description: 'Learn SQL from basics to advanced queries. Master database management and data manipulation.',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
      videoTitle: 'SQL Complete Course',
      videoDescription: 'Complete SQL tutorial for database management.',
      youtubeUrl: 'https://youtu.be/Q-icS7yZz5k',
    },
  ];

  for (const courseData of courses) {
    // Create or update course
    const course = await prisma.subject.upsert({
      where: { slug: courseData.slug },
      update: {
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        isPublished: true,
      },
      create: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        isPublished: true,
      },
    });

    console.log('Created/Updated course:', course.title);

    // Create section for this course
    const section = await prisma.section.create({
      data: {
        subjectId: course.id,
        title: 'Course Content',
        orderIndex: 1,
      },
    });

    // Create video for this course
    await prisma.video.create({
      data: {
        sectionId: section.id,
        title: courseData.videoTitle,
        description: courseData.videoDescription,
        youtubeUrl: courseData.youtubeUrl,
        orderIndex: 1,
        durationSeconds: 3600, // 1 hour placeholder
      },
    });

    console.log('Created video for:', course.title);
  }

  console.log('Seed completed successfully! Created 6 courses.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
