import mongoose from 'mongoose';

const legoSetSchema = new mongoose.Schema(
	{
		setId: {
			type: String,
			required: true,
		},
		setName: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		setDescription: {
			type: String,
			trim: true,
		},
		setImage: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
			},
		},
		parts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Part',
			},
		],
		numberOfSets: {
			type: Number,
			required: true,
			default: 1,
		},
		xValue: {
			type: Number,
			required: true,
			default: 1,
		},
		yValue: {
			type: Number,
			required: true,
			default: 1,
		},
	},
	{ timestamps: true }
);

// Pre-save hook to generate setId automatically
legoSetSchema.pre('validate', async function (next) {
	if (this.isNew && !this.setId) {
		const lastSet = await mongoose
			.model('LegoSet')
			.findOne({}, { setId: 1 })
			.sort({ createdAt: -1 })
			.lean();

		if (lastSet && lastSet.setId) {
			// Extract the number from last setId
			const num = parseInt(lastSet.setId.split('-')[1]) + 1;
			this.setId = `SET-${num.toString().padStart(4, '0')}`;
		} else {
			this.setId = 'SET-0001';
		}
	}
	next();
});

const LegoSet = mongoose.model('LegoSet', legoSetSchema);
export default LegoSet;
