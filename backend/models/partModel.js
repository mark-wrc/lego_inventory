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
			trim: true,
		},
		color: {
			type: String,
			trim: true,
		},
		PaB: {
			type: Number,
			default: 0,
		},
		US: {
			type: Number,
			default: 0,
		},
		weight: {
			type: Number,
			default: 0,
		},
		quantity: {
			type: Number,
			default: 0,
		},
		ordered: {
			type: Number,
			default: 0,
		},
		inventory: {
			type: Number,
			default: 0,
		},

		qSet: {
			type: Number,
			default: 0,
		},
		needed: {
			type: Number,
			default: 0,
		},
		World: {
			type: Number,
			default: 0,
		},
		cost: {
			type: Number,
			default: 0,
		},
		salesPrice: {
			type: Number,
			default: 0,
		},
		pabPrice_x: {
			type: Number,
			default: 0,
		},
		costPrice_y: {
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
