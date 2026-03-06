'use client';

import { SubjectTree } from '@/lib/subjects';
import { CheckCircle, Lock, PlayCircle } from './Icons';

interface LessonSidebarProps {
  subject: SubjectTree;
  selectedVideoId: string | null;
  onSelectVideo: (videoId: string) => void;
}

export function LessonSidebar({ subject, selectedVideoId, onSelectVideo }: LessonSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{subject.title}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {subject.sections.reduce((acc, s) => acc + s.videos.length, 0)} lessons
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {subject.sections.map((section) => (
          <div key={section.id}>
            <div className="px-4 py-3 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {section.videos.map((video) => (
                <li key={video.id}>
                  <button
                    onClick={() => !video.locked && onSelectVideo(video.id)}
                    disabled={video.locked}
                    className={`w-full px-4 py-3 flex items-start text-left transition-colors ${
                      selectedVideoId === video.id
                        ? 'bg-primary-50 border-l-4 border-primary-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    } ${video.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {video.locked ? (
                        <Lock className="h-5 w-5 text-gray-400" />
                      ) : video.isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${
                        selectedVideoId === video.id ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {video.title}
                      </p>
                      {video.durationSeconds && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDuration(video.durationSeconds)}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
