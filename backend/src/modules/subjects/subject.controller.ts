import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getSubjectsList,
  getSubjectById,
  getSubjectBySlug,
  getSubjectTree,
  getFirstVideo,
} from './subject.service';
import { AppError } from '../../middleware/errorHandler';

const listQuerySchema = z.object({
  page: z.string().default('1').transform(Number).pipe(z.number().min(1)),
  pageSize: z.string().default('10').transform(Number).pipe(z.number().min(1).max(100)),
  q: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function listSubjects(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await getSubjectsList(query.page, query.pageSize, query.q);
    
    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = paramsSchema.parse(req.params);
    
    // Try to parse as number for ID, otherwise treat as slug
    const isNumeric = /^\d+$/.test(id);
    const subject = isNumeric 
      ? await getSubjectById(id)
      : await getSubjectBySlug(id);
    
    res.json({
      status: 'success',
      data: { subject },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTree(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = paramsSchema.parse(req.params);
    const userId = req.user?.userId;
    
    const tree = await getSubjectTree(id, userId);
    
    res.json({
      status: 'success',
      data: { tree },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFirstVideoHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = paramsSchema.parse(req.params);
    const result = await getFirstVideo(id);
    
    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
