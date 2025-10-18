import mongoose from 'mongoose';

const partSchema = new mongoose.Schema(
	{
		item_id: {
			type: Number,
			required: true,
		},
		part_id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		item_description: {
			type: String,
		},
		PaB: {
			type: Number,
			default: 0,
		},
		color: {
			type: String,
		},
		weight: {
			type: Number,
		},
		US: {
			type: Number,
		},
		quantity: {
			type: Number,
			default: 1,
		},
		ordered: {
			type: Number,
			default: 0,
		},
		inventory: {
			type: Number,
			default: 0,
		},
		bsStandard: {
			type: String,
			enum: ['BS', 'Standard'],
			default: 'BS',
		},
		partImage: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
			},
		},
	},
	{ timestamps: true }
);

// Ensure unique combination of item_id + part_id
partSchema.index({ item_id: 1, part_id: 1 }, { unique: true });

const Part = mongoose.model('Part', partSchema);
export default Part;
