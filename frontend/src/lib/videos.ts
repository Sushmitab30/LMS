import { api } from './api';

export interface VideoDetails {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  youtubeVideoId: string | null;
  orderIndex: number;
  durationSeconds: number | null;
  section: {
    id: string;
    title: string;
  };
  subject: {
    id: string;
    title: string;
    slug: string;
  };
  navigation: {
    previousVideoId: string | null;
    nextVideoId: string | null;
  };
  locked: boolean;
  unlockReason: string | null;
}

export async function getVideo(id: string): Promise<{ video: VideoDetails }> {
  const response = await api.get(`/videos/${id}`);
  return response.data.data;
}
