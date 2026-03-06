'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { VideoDetails, getVideo } from '@/lib/videos';
import { getVideoProgress, updateVideoProgress } from '@/lib/progress';
import Link from 'next/link';

interface VideoPlayerProps {
  videoId: string;
  subjectId: string;
  onComplete?: () => void;
}

export function VideoPlayer({ videoId, subjectId, onComplete }: VideoPlayerProps) {
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lastReportedTime = useRef(0);

  useEffect(() => {
    async function loadVideo() {
      setIsLoading(true);
      try {
        const result = await getVideo(videoId);
        setVideo(result.video);
        setIsCompleted(!result.video.locked);
        
        // Load saved progress
        const progress = await getVideoProgress(videoId);
        // Note: YouTube iframe API doesn't easily support seeking on load
        // This would need the YouTube IFrame API for full implementation
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load video');
      } finally {
        setIsLoading(false);
      }
    }

    loadVideo();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [videoId]);

  // Simulate progress tracking (in a real implementation, use YouTube IFrame API)
  useEffect(() => {
    if (!video || video.locked) return;

    // Report progress every 10 seconds
    progressInterval.current = setInterval(async () => {
      // In real implementation, get current time from YouTube player
      // For now, we'll just track that user is watching
      lastReportedTime.current += 10;
      
      try {
        await updateVideoProgress(videoId, {
          lastPositionSeconds: lastReportedTime.current,
        });
      } catch (err) {
        console.error('Failed to update progress:', err);
      }
    }, 10000);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [video, videoId]);

  const handleMarkComplete = useCallback(async () => {
    try {
      await updateVideoProgress(videoId, {
        lastPositionSeconds: video?.durationSeconds || 0,
        isCompleted: true,
      });
      setIsCompleted(true);
      onComplete?.();
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  }, [videoId, video, onComplete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Video not found</div>
      </div>
    );
  }

  if (video.locked) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Lesson Locked</h3>
          <p className="mt-2 text-gray-600">{video.unlockReason || 'Complete the previous lesson to unlock.'}</p>
        </div>
      </div>
    );
  }

  const embedUrl = video.youtubeVideoId
    ? `https://www.youtube.com/embed/${video.youtubeVideoId}?enablejsapi=1&rel=0`
    : video.youtubeUrl.replace('watch?v=', 'embed/');

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href={`/subjects`} className="text-sm text-gray-500 hover:text-gray-700">
          Courses
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-sm text-gray-900">{video.subject.title}</span>
      </div>

      {/* Video Player */}
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          title={video.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Video Info */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
        <p className="mt-2 text-gray-600">{video.section.title}</p>
        
        {video.description && (
          <div className="mt-4 prose prose-sm max-w-none">
            <p className="text-gray-700">{video.description}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        {video.navigation.previousVideoId ? (
          <button
            onClick={() => window.location.href = `/learn/${video.subject.slug}?video=${video.navigation.previousVideoId}`}
            className="btn-secondary"
          >
            ← Previous Lesson
          </button>
        ) : (
          <div />
        )}

        {!isCompleted && (
          <button
            onClick={handleMarkComplete}
            className="btn-primary"
          >
            Mark as Complete
          </button>
        )}

        {video.navigation.nextVideoId ? (
          <button
            onClick={() => window.location.href = `/learn/${video.subject.slug}?video=${video.navigation.nextVideoId}`}
            className="btn-primary"
          >
            Next Lesson →
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
