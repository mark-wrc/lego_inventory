import Part from '../models/partModel.js';
import catchAsyncError from '../utils/catchAsyncError.js';
import { customErrorHandler } from '../utils/customErrorHandler.js';
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
 * Update a single Part
 * PUT /api/part/:id
 */
export const updatePart = catchAsyncError(async (req, res, next) => {
	const { id } = req.params;

	const data = {
		...req.body,
		weight: req.body.weight ? parseWeight(req.body.weight) : undefined,
		US: req.body.US ? parseUSPrice(req.body.US) : undefined,
	};

	const part = await Part.findByIdAndUpdate(id, data, { new: true });

	if (!part) {
		return next(
			new customErrorHandler(`Part with ID '${id}' not found`, 404)
		);
	}

	res.status(200).json({ success: true, data: part });
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
