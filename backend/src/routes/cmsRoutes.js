import { Router } from 'express';
import { getCmsPage, createCmsPage, updateCmsPage, deleteCmsPage } from '../controllers/cmsController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.get('/page/:slug', getCmsPage);
router.post('/', authenticateJWT, createCmsPage);
router.put('/:id', authenticateJWT, updateCmsPage);
router.delete('/:id', authenticateJWT, deleteCmsPage);

export default router;
