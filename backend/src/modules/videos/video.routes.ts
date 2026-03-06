import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { getVideo } from './video.controller';
import { authenticate } from '../../middleware/authenticate';

const router: RouterType = Router();

router.get('/:id', authenticate, getVideo);

export default router;
