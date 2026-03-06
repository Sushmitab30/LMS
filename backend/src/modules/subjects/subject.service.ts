import { AppError } from '../../middleware/errorHandler';
import {
  findAllPublishedSubjects,
  findSubjectById,
  findSubjectBySlug,
  findSubjectTree,
  findFirstVideoInSubject,
} from './subject.repository';

export async function getSubjectsList(page: number, pageSize: number, search?: string) {
  return findAllPublishedSubjects(page, pageSize, search);
}

export async function getSubjectById(id: string) {
  const subjectId = parseInt(id);
  const subject = await findSubjectById(subjectId);
  
  if (!subject) {
    throw new AppError(404, 'Subject not found');
  }

  if (!subject.isPublished) {
    throw new AppError(404, 'Subject not found');
  }

  return {
    ...subject,
    id: subject.id.toString(),
  };
}

export async function getSubjectBySlug(slug: string) {
  const subject = await findSubjectBySlug(slug);
  
  if (!subject) {
    throw new AppError(404, 'Subject not found');
  }

  if (!subject.isPublished) {
    throw new AppError(404, 'Subject not found');
  }

  return {
    ...subject,
    id: subject.id.toString(),
  };
}

export async function getSubjectTree(subjectId: string, userId?: string) {
  const id = parseInt(subjectId);
  const uid = userId ? parseInt(userId) : undefined;
  
  const tree = await findSubjectTree(id, uid);
  
  if (!tree) {
    throw new AppError(404, 'Subject not found');
  }

  return tree;
}

export async function getFirstVideo(subjectId: string) {
  const id = parseInt(subjectId);
  const videoId = await findFirstVideoInSubject(id);
  
  if (!videoId) {
    throw new AppError(404, 'No videos found in this subject');
  }

  return { videoId };
}
