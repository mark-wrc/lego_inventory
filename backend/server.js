import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './config/dbConnect.js';

import legoSetRoutes from './routes/legoSetRoutes.js';
import partRoutes from './routes/partRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

import { errorHandler, notFound } from './utils/customErrorHandler.js';

import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileName);
const PORT = process.env.PORT || 5000;
dotenv.config({ path: './backend/config/config.env' });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../frontend/dist')));

	// Catch-all for React Router paths
	app.get(/.*/, (req, res) => {
		res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
	});
}

// Add Routes
app.use('/api', legoSetRoutes);
app.use('/api', partRoutes);
app.use('/api', orderRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server after DB connection
const startServer = async () => {
	try {
		await dbConnect();
		app.listen(PORT, () => {
			console.log(`Server started at Port: ${PORT}`);
		});
	} catch (error) {
		console.error('Failed to connect to DB', error);
		process.exit(1);
	}
};

startServer();
