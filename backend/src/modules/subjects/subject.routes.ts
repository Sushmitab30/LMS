import { Router } from 'express';
import { listSubjects, getSubject, getTree, getFirstVideoHandler } from './subject.controller';
import { authenticate, optionalAuth } from '../../middleware/authenticate';

const router = Router();

router.get('/', optionalAuth, listSubjects);
router.get('/:id', optionalAuth, getSubject);
router.get('/:id/tree', authenticate, getTree);
router.get('/:id/first-video', authenticate, getFirstVideoHandler);

export default router;
