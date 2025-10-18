import express from 'express';
import {
	getAllLegoSets,
	getLegoSetById,
	createOrUpdateLegoSet,
	updateLegoSet,
	deleteLegoSet,
	uploadLegoSetImage,
} from '../controllers/legoSetController.js';

const router = express.Router();

// Lego set routes
router.get('/legoset', getAllLegoSets); // Get all sets
router.get('/legoset/:id', getLegoSetById); // Get set by ID
router.post('/legoset/new', createOrUpdateLegoSet); // Create/update set
router.put('/legoset/:id', updateLegoSet); // Update set name/description
router.delete('/legoset/:id', deleteLegoSet); // Delete set
router.route('/legoset/:id/image').put(uploadLegoSetImage);

export default router;
