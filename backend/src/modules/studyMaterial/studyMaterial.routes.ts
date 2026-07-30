import express from 'express';
import { createStudyMaterial, getStudyMaterials, getStudyMaterialById, deleteStudyMaterial, updateStudyMaterial } from './studyMaterial.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import upload from '../../middleware/upload.middleware';

const router = express.Router();

router.post('/', protect, authorize('admin'), upload.array('pdfs', 10), createStudyMaterial);
router.get('/', getStudyMaterials);
router.get('/:id', getStudyMaterialById);
router.put('/:id', protect, authorize('admin'), upload.array('pdfs', 10), updateStudyMaterial);
router.delete('/:id', protect, authorize('admin'), deleteStudyMaterial);

export default router;
