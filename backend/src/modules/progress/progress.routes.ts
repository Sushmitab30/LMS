import { Router } from 'express';
import type { Router as RouterType } from 'express';
import {
  getSubjectProgressHandler,
  getVideoProgressHandler,
  updateVideoProgressHandler,
} from './progress.controller';
import { authenticate } from '../../middleware/authenticate';

const router: RouterType = Router();

router.get('/subjects/:id', authenticate, getSubjectProgressHandler);
router.get('/videos/:id', authenticate, getVideoProgressHandler);
router.post('/videos/:id', authenticate, updateVideoProgressHandler);

export default router;
