import Part from '../models/partModel.js';
import catchAsyncError from '../utils/catchAsyncError.js';
import { customErrorHandler } from '../utils/customErrorHandler.js';
import { parseUSPrice, parseWeight } from '../utils/partUtils.js';
import { deleteImage, uploadImage } from '../utils/uploadImage.js';

/**
 * Get all parts
 * GET /api/parts
 */
export const getAllParts = catchAsyncError(async (req, res, next) => {
	const parts = await Part.find();

	if (!parts) {
		return next(new customErrorHandler('No parts available', 404));
	}

	res.status(200).json({
		success: true,
		data: parts,
	});
});

/**
 * Get part by Id
 * GET /api/part/:id
 */

export const getPartById = catchAsyncError(async (req, res, next) => {
	const { id } = req.params;

	const partById = await Part.findById(id);

	if (!partById) {
		return next(new customErrorHandler('Part not found', 404));
	}

	res.status(200).json({
		success: true,
		data: partById,
	});
});

/**
 * Create new Part
 * POST /api/part/new
 */
export const createPart = catchAsyncError(async (req, res, next) => {
	const {
		item_id,
		part_id,
		name,
		item_description,
		PaB,
		color,
		weight,
		US,
		quantity,
		ordered,
		inventory,
		bsStandard,
	} = req.body;

	if (!item_id || !part_id || !name) {
		return next(
			new customErrorHandler(
				"'item_id', 'part_id' and 'name' are required",
				400
			)
		);
	}

	const existingPart = await Part.findOne({ item_id, part_id });
	if (existingPart) {
		return next(
			new customErrorHandler(
				`Part with item_id ${item_id} and part_id ${part_id} already exists`,
				400
			)
		);
	}
	const part = await Part.create({
		item_id,
		part_id,
		name,
		item_description,
		PaB: PaB || 0,
		color,
		weight: weight ? parseWeight(weight) : undefined,
		US: US ? parseUSPrice(US) : undefined,
		quantity: quantity || 1,
		ordered: ordered || 0,
		inventory: inventory || 0,
		bsStandard: bsStandard || 'BS',
	});

	res.status(201).json({
		success: true,
		message: 'Part created successfully',
		data: part,
	});
});

/**
 * Update multiple parts in bulk
 * PUT /api/parts/bulk
 */
export const updateMultipleParts = catchAsyncError(async (req, res, next) => {
	let { parts } = req.body;

	// Allow single object input
	if (!Array.isArray(parts)) {
		if (req.body && Object.keys(req.body).length > 0) {
			parts = [req.body];
		} else {
			return next(
				new customErrorHandler('No parts provided for update', 400)
			);
		}
	}

	if (parts.length === 0) {
		return next(new customErrorHandler('Empty parts array', 400));
	}

	//console.log('Parts Request Body:', parts);

	const bulkOps = parts.map((p) => ({
		updateOne: {
			filter: { _id: p._id },
			update: {
				$set: {
					item_id: p.item_id,
					part_id: p.part_id,
					name: p.name,
					item_description: p.item_description,
					color: p.color,
					PaB: p.PaB ?? 0,
					US: p.US ?? 0,
					weight: p.weight ?? 0,
					quantity: p.quantity ?? 0,
					ordered: p.ordered ?? 0,
					inventory: p.inventory ?? 0,
					qSet: p.qSet ?? 0,
					needed: p.needed ?? 0,
					World: p.World ?? 0,
					cost: p.cost ?? 0,
					salesPrice: p.salesPrice ?? 0,
					pabPrice_x: p.pabPrice_x ?? 0,
					costPrice_y: p.costPrice_y ?? 0,
					bsStandard: p.bsStandard ?? 'BS',
				},
			},
		},
	}));

	const updatedParts = await Part.bulkWrite(bulkOps);

	// 	console.log(updatedParts);
	// 	console.log(`message: Updated ${parts.length} part(s) successfully`);
	// -
	res.status(200).json({
		success: true,
		message: `Updated ${parts.length} part(s) successfully`,
	});
});
export const updatePart = catchAsyncError(async (req, res, next) => {
	const { id } = req.params;

	console.log('CHECK REQU - ', req.body);

	if (!id) {
		return next(new customErrorHandler('Part ID is required', 400));
	}

	// Map and sanitize fields from request body
	const data = {
		item_id: req.body.item_id,
		part_id: req.body.part_id,
		name: req.body.name,
		item_description: req.body.item_description,
		color: req.body.color,
		PaB: req.body.PaB ?? 0,
		US: req.body.US ?? 0,
		weight: req.body.weight ?? 0,
		quantity: req.body.quantity ?? 0,
		ordered: req.body.ordered ?? 0,
		inventory: req.body.inventory ?? 0,
		qSet: req.body.qSet ?? 0,
		needed: req.body.needed ?? 0,
		World: req.body.World ?? 0,
		cost: req.body.cost ?? 0,
		salesPrice: req.body.salesPrice ?? 0,
		pabPrice_x: req.body.pabPrice_x ?? 0,
		costPrice_y: req.body.costPrice_y ?? 0,
		bsStandard: req.body.bsStandard ?? 'BS',
	};

	// Parse special values
	if (data.weight) data.weight = parseWeight(data.weight);
	if (data.US) data.US = parseUSPrice(data.US);

	const updatedPart = await Part.findByIdAndUpdate(id, data, { new: true });

	if (!updatedPart) {
		return next(
			new customErrorHandler(`Part with ID '${id}' not found`, 404)
		);
	}
	console.log('Updated Parts:', updatedPart);

	res.status(200).json({
		success: true,
		message: 'Part updated successfully',
		data: updatedPart,
	});
});

/**
 * Delete a single Part
 * DELETE /api/part/:id
 */
export const deletePart = catchAsyncError(async (req, res, next) => {
	const { id } = req.params;

	const part = await Part.findByIdAndDelete(id);

	if (!part) {
		return next(
			new customErrorHandler(`Part with ID '${id}' not found`, 404)
		);
	}

	res.status(200).json({
		success: true,
		message: 'Part deleted successfully',
	});
});

/**
 * Upload Part Image
 * PUT
 */

export const uploadPartImage = catchAsyncError(async (req, res, next) => {
	try {
		const { image } = req.body;
		if (!image) {
			return next(new customErrorHandler('No image provided', 400));
		}

		// Find the collection first to check if it already has an image
		const existingPart = await Part.findById(req.params.id);

		if (!existingPart) {
			console.log('existing Image details', existingPart.partImage);

			return next(new customErrorHandler('Part not found', 404));
		}

		// If the Part already has an image, delete it from Cloudinary
		if (existingPart.partImage && existingPart.partImage.public_id) {
			await deleteImage(existingPart.partImage.public_id);

			if (deleteImage) {
				console.log('Part Data');
			}
		}

		// Use standardized image upload function
		const url = await uploadImage(image, 'Lego_Inventory/Part');
		// console.log('Uploaded URL:', url);

		// Update the LegoSet with the new image URL
		const PartImage = await Part.findByIdAndUpdate(
			req.params.id,
			{ partImage: url }, // Update operation
			{ new: true, runValidators: true } // Options
		);

		if (PartImage) {
			console.log(PartImage);
		}
		res.status(200).json({
			success: true,
			message: 'Part image updated successfully',
			data: PartImage,
		});
	} catch (error) {
		return next(
			new customErrorHandler(error.message || 'Image upload failed', 500)
		);
	}
});
