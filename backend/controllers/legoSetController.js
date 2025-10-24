import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import LegoSet from '../models/legoSetModel.js';
import Part from '../models/partModel.js';
import catchAsyncError from '../utils/catchAsyncError.js';
import { customErrorHandler } from '../utils/customErrorHandler.js';
import { parseWeight, parseUSPrice } from '../utils/partUtils.js';
import { deleteImage, uploadImage } from '../utils/uploadImage.js';

/**
 * GET all Lego sets
 * GET /api/legoset
 */
export const getAllLegoSets = catchAsyncError(async (req, res, next) => {
	const legoSets = await LegoSet.find().populate('parts');

	res.status(200).json({
		success: true,
		data: legoSets,
	});
});

/**
 * GET single Lego set by ID
 * GET /api/legoset/:id
 */
export const getLegoSetById = catchAsyncError(async (req, res, next) => {
	const { id } = req.params;

	const legoSet = await LegoSet.findById(id).populate('parts');

	if (!legoSet) {
		return next(
			new customErrorHandler(`Lego set with ID '${id}' not found`, 404)
		);
	}

	res.status(200).json({
		success: true,
		data: legoSet,
	});
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createOrUpdateLegoSet = catchAsyncError(async (req, res, next) => {
	const { setName, description, parts } = req.body;

	console.log('📥 in createOrUpdateLegoSet');

	if (!setName || !Array.isArray(parts)) {
		return next(
			new customErrorHandler(
				"Invalid request: 'setName' and 'parts' array are required",
				400
			)
		);
	}

	// 📝 1️⃣ Log request body to file (for debugging / auditing)
	try {
		const logDir = path.join(__dirname, '../../logs');
		if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

		const logFilePath = path.join(logDir, 'legoSetRequests.log');
		const timestamp = new Date().toISOString();

		fs.appendFileSync(
			logFilePath,
			`\n\n=== ${timestamp} ===\n${JSON.stringify(req.body, null, 2)}\n`
		);

		console.log(`🗂️ Request logged to: ${logFilePath}`);
	} catch (logErr) {
		console.error('⚠️ Failed to log request body:', logErr);
	}

	// 2️⃣ Upsert parts
	const partIds = [];
	for (const p of parts) {
		const data = {
			...p,
			weight: parseWeight(p.weight),
			US: parseUSPrice(p.US),
			bsStandard: p['BS/Standard'] || 'BS',
		};

		const part = await Part.findOneAndUpdate(
			{ item_id: p.item_id, part_id: p.part_id },
			data,
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		partIds.push(part._id);
	}

	// 3️⃣ Upsert Lego set
	let legoSet = await LegoSet.findOne({ setName });
	if (!legoSet) {
		legoSet = await LegoSet.create({
			setName,
			description,
			parts: partIds,
		});
	} else {
		legoSet.setDescription = description || legoSet.setDescription;
		legoSet.parts = partIds;
		await legoSet.save();
	}

	const populatedSet = await LegoSet.findById(legoSet._id).populate('parts');

	// 4️⃣ Send response
	res.status(201).json({
		success: true,
		message: `Lego set '${setName}' created/updated successfully`,
		data: populatedSet,
	});
});

/**
 * Create or Update Lego set with parts
 * POST /api/legoset/new
 */
/* export const createOrUpdateLegoSet = catchAsyncError(async (req, res, next) => {
	const { setName, description, parts } = req.body;

	console.log('in createOrUpadateLegoSet');
	if (!setName || !Array.isArray(parts)) {
		return next(
			new customErrorHandler(
				"Invalid request: 'setName' and 'parts' array are required",
				400
			)
		);
	}

	// Upsert parts
	const partIds = [];
	for (const p of parts) {
		const data = {
			...p,
			weight: parseWeight(p.weight),
			US: parseUSPrice(p.US),
			bsStandard: p['BS/Standard'] || 'BS',
		};

		const part = await Part.findOneAndUpdate(
			{ item_id: p.item_id, part_id: p.part_id },
			data,
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		partIds.push(part._id);
	}

	// Upsert Lego set
	let legoSet = await LegoSet.findOne({ setName });
	if (!legoSet) {
		legoSet = await LegoSet.create({
			setName,
			description,
			parts: partIds,
		});
	} else {
		legoSet.setDescription = description || legoSet.setDescription;
		legoSet.parts = partIds;
		await legoSet.save();
	}

	const populatedSet = await LegoSet.findById(legoSet._id).populate('parts');

	res.status(201).json({
		success: true,
		message: `Lego set '${setName}' created/updated successfully`,
		data: populatedSet,
	});
});
 */
/**
 * Update Lego set name and description
 * PUT /api/legoset/:id
 */
export const updateLegoSet = catchAsyncError(async (req, res, next) => {
	const { id } = req.params;
	const { setDescription, numberOfSets, xValue, yValue } = req.body;

	console.log('🧱 Incoming Lego Set Update Payload:', req.body);

	const legoSet = await LegoSet.findById(id);
	if (!legoSet) {
		return next(
			new customErrorHandler(`Lego set with ID '${id}' not found`, 404)
		);
	}

	let updatedFields = [];

	if (
		typeof setDescription === 'string' &&
		setDescription !== legoSet.setDescription
	) {
		legoSet.setDescription = setDescription;
		updatedFields.push('setDescription');
	}

	if (
		typeof numberOfSets === 'number' &&
		numberOfSets !== legoSet.numberOfSets
	) {
		legoSet.numberOfSets = numberOfSets;
		updatedFields.push('numberOfSets');
	}

	if (typeof xValue === 'number' && xValue !== legoSet.xValue) {
		legoSet.xValue = xValue;
		updatedFields.push('xValue');
	}

	if (typeof yValue === 'number' && yValue !== legoSet.yValue) {
		legoSet.yValue = yValue;
		updatedFields.push('yValue');
	}

	if (updatedFields.length === 0) {
		console.log('⚠️ No changes detected in LegoSet update request.');
		return res.status(200).json({
			success: true,
			message: 'No updates were made. All values are the same.',
			data: legoSet,
		});
	}

	const updatedSet = await legoSet.save();

	console.log('✅ Updated LegoSet fields:', updatedSet);

	const populatedSet = await LegoSet.findById(updatedSet._id).populate(
		'parts'
	);

	res.status(200).json({
		success: true,
		message: 'Lego set updated successfully',
		updatedFields,
		data: populatedSet,
	});
});

/**
 * Delete Lego set
 * DELETE /api/legoset/:id
 */
export const deleteLegoSet = catchAsyncError(async (req, res, next) => {
	const { id } = req.params;

	const deletedSet = await LegoSet.findByIdAndDelete(id);

	if (!deletedSet) {
		return next(customErrorHandler('Unable to delete', 404));
	}

	res.status(200).json({
		success: true,
		message: `Lego set '${deletedSet.setName}' deleted successfully`,
	});
});

/**
 * Upload Lego Image
 */

export const uploadLegoSetImage = catchAsyncError(async (req, res, next) => {
	try {
		const { image } = req.body;
		if (!image) {
			return next(new customErrorHandler('No image provided', 400));
		}

		// Find the collection first to check if it already has an image
		const existingLegoSet = await LegoSet.findById(req.params.id);

		if (!existingLegoSet) {
			return next(new customErrorHandler('Legoset not found', 404));
		}

		// If the LegoSet already has an image, delete it from Cloudinary
		if (existingLegoSet.setImage && existingLegoSet.setImage.public_id) {
			await deleteImage(existingLegoSet.setImage.public_id);
		}

		// Use standardized image upload function
		const url = await uploadImage(image, 'Lego_Inventory/LegoSet');
		console.log('Uploaded URL:', url);

		// Update the LegoSet with the new image URL
		const LegoSetImage = await LegoSet.findByIdAndUpdate(
			req.params.id,
			{ setImage: url }, // Update operation
			{ new: true, runValidators: true } // Options
		);

		res.status(200).json({
			success: true,
			message: 'LegoSet image updated successfully',
			data: LegoSetImage,
		});
	} catch (error) {
		return next(
			new customErrorHandler(error.message || 'Image upload failed', 500)
		);
	}
});
