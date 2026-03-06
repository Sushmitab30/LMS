'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubjects, Subject } from '@/lib/subjects';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSubjects() {
      try {
        const result = await getSubjects(1, 20);
        setSubjects(result.subjects);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load subjects');
      } finally {
        setIsLoading(false);
      }
    }

    loadSubjects();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
        <p className="mt-2 text-gray-600">Explore our collection of courses and start learning today.</p>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/learn/${subject.slug}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-200 relative">
                {subject.thumbnail ? (
                  <img
                    src={subject.thumbnail}
                    alt={subject.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{subject.title}</h2>
                {subject.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{subject.description}</p>
                )}
                <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                  Start Learning
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
