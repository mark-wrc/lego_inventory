import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import dbConnect from './config/dbConnect.js';
import legoSetRoutes from './routes/legoSetRoutes.js';
import partRoutes from './routes/partRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler, notFound } from './utils/customErrorHandler.js';

// Environment variables
dotenv.config({ path: './backend/config/config.env' });

// Express app
const app = express();
const PORT = process.env.PORT || 5000;

// __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/legoSets', legoSetRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/orders', orderRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
	const distDir = path.join(__dirname, '../frontend/dist');
	const indexFile = path.join(distDir, 'index.html');

	if (!fs.existsSync(distDir) || !fs.existsSync(indexFile)) {
		console.error(
			'dist directory or index.html not found:',
			distDir,
			indexFile
		);
	} else {
		console.log('Production frontend found. Serving static files...');
		app.use(express.static(distDir));

		// Catch-all route for React Router
		app.get('*', (req, res) => {
			if (!req.path.startsWith('/api/')) {
				return res.sendFile(indexFile);
			}
			res.status(404).json({ success: false, message: 'Not Found' });
		});
	}
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server after DB connection
const startServer = async () => {
	try {
		await dbConnect();
		app.listen(PORT, () => {
			console.log(
				`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
			);
		});
	} catch (error) {
		console.error('Failed to connect to DB:', error);
		process.exit(1);
	}
};

startServer();
