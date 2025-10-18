import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import dbConnect from './config/dbConnect.js';
import legoSetRoutes from './routes/legoSetRoutes.js';
import partRoutes from './routes/partRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler, notFound } from './utils/customErrorHandler.js';

// Load environment variables
dotenv.config({ path: './backend/config/config.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS (only if frontend is on a different domain)
if (process.env.FRONTEND_URL) {
	app.use(
		cors({
			origin: process.env.FRONTEND_URL,
			credentials: true,
		})
	);
}

// --- API Routes under /api ---
app.use('/api', legoSetRoutes);
app.use('/api', partRoutes);
app.use('/api', orderRoutes);

// --- Serve React frontend in production ---
if ((process.env.NODE_ENV || '').toLowerCase() === 'production') {
	const distDir = path.join(__dirname, '../frontend/dist');
	const indexFile = path.join(distDir, 'index.html');

	// Serve static frontend files
	app.use(express.static(distDir));

	// Fallback middleware for React Router
	app.use((req, res, next) => {
		if (req.path.startsWith('/api')) return next(); // Pass API requests to API routes
		res.sendFile(indexFile); // Serve React app for all other routes
	});
}

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start server after DB connection ---
const startServer = async () => {
	try {
		await dbConnect();
		app.listen(PORT, () => {
			console.log(
				`Server running in ${
					process.env.NODE_ENV || 'development'
				} mode on port ${PORT}`
			);
		});
	} catch (error) {
		console.error('Failed to connect to DB:', error);
		process.exit(1);
	}
};

startServer();
