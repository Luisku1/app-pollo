import express from 'express';
import { recalculateCurrentNumina } from '../controllers/refactors.controller.js';

const router = express.Router();

router.get('/numina/:companyId', recalculateCurrentNumina);

export default router;