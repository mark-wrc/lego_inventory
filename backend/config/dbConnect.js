import mongoose from 'mongoose';

const dbConnect = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`connected to database: ${conn.connection.host}`);
	} catch (error) {
		console.log(`Error : ${error}`);
		process.exit(1);
	}
};

export default dbConnect;
