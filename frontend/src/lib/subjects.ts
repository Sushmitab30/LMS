import { api } from './api';

export interface Subject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  orderIndex: number;
  durationSeconds: number | null;
  isCompleted: boolean;
  locked: boolean;
}

export interface Section {
  id: string;
  title: string;
  orderIndex: number;
  videos: Video[];
}

export interface SubjectTree {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  sections: Section[];
}

export interface SubjectsResponse {
  subjects: Subject[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function getSubjects(page = 1, pageSize = 10, search?: string): Promise<SubjectsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) {
    params.append('q', search);
  }
  
  const response = await api.get(`/subjects?${params.toString()}`);
  return response.data.data;
}

export async function getSubject(id: string): Promise<{ subject: Subject }> {
  const response = await api.get(`/subjects/${id}`);
  return response.data.data;
}

export async function getSubjectTree(id: string): Promise<{ tree: SubjectTree }> {
  const response = await api.get(`/subjects/${id}/tree`);
  return response.data.data;
}

export async function getFirstVideo(subjectId: string): Promise<{ videoId: string }> {
  const response = await api.get(`/subjects/${subjectId}/first-video`);
  return response.data.data;
}
