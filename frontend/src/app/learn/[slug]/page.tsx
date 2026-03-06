'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SubjectTree, getSubjectTree } from '@/lib/subjects';
import { VideoPlayer } from '@/components/VideoPlayer';
import { LessonSidebar } from '@/components/LessonSidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function LearnPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuth();
  
  const [subject, setSubject] = useState<SubjectTree | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Please log in to access this course');
      setIsLoading(false);
      return;
    }

    async function loadSubject() {
      try {
        const result = await getSubjectTree(slug);
        setSubject(result.tree);
        
        // Select first unlocked video
        const firstUnlocked = findFirstUnlockedVideo(result.tree);
        if (firstUnlocked) {
          setSelectedVideoId(firstUnlocked);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    }

    loadSubject();
  }, [slug, isAuthenticated]);

  function findFirstUnlockedVideo(tree: SubjectTree): string | null {
    for (const section of tree.sections) {
      for (const video of section.videos) {
        if (!video.locked) {
          return video.id;
        }
      }
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Course not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <LessonSidebar
        subject={subject}
        selectedVideoId={selectedVideoId}
        onSelectVideo={setSelectedVideoId}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {selectedVideoId ? (
          <VideoPlayer
            videoId={selectedVideoId}
            subjectId={subject.id}
            onComplete={() => {
              // Refresh subject tree to update locked status
              getSubjectTree(slug).then(result => setSubject(result.tree));
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{subject.title}</h2>
              <p className="text-gray-600">Select a lesson from the sidebar to start learning.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
