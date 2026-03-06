import { Router } from 'express';
import { getVideo } from './video.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.get('/:id', authenticate, getVideo);

export default router;
