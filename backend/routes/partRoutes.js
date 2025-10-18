import express from 'express';
import {
	createPart,
	deletePart,
	getAllParts,
	getPartById,
	updatePart,
	uploadPartImage,
} from '../controllers/partController.js';

const router = express.Router();
// Part Routes
router.route('/parts').get(getAllParts);
router.route('/part/new').post(createPart);
router.route('/part/:id').get(getPartById);

router.put('/part/:id', updatePart); // Update part
router.delete('/part/:id', deletePart); // Delete part
router.route('/part/:id/image').put(uploadPartImage); //

export default router;
