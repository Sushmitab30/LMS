import { api } from './api';

export interface SubjectProgress {
  totalVideos: number;
  completedVideos: number;
  percentComplete: number;
  lastVideoId: string | null;
  lastPositionSeconds: number;
}

export interface VideoProgress {
  lastPositionSeconds: number;
  isCompleted: boolean;
  completedAt: string | null;
}

export async function getSubjectProgress(subjectId: string): Promise<{ progress: SubjectProgress }> {
  const response = await api.get(`/progress/subjects/${subjectId}`);
  return response.data.data;
}

export async function getVideoProgress(videoId: string): Promise<{ progress: VideoProgress }> {
  const response = await api.get(`/progress/videos/${videoId}`);
  return response.data.data;
}

export async function updateVideoProgress(
  videoId: string,
  data: {
    lastPositionSeconds: number;
    isCompleted?: boolean;
  }
): Promise<{ progress: VideoProgress }> {
  const response = await api.post(`/progress/videos/${videoId}`, data);
  return response.data.data;
}
