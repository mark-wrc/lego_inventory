import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dbConnect from './config/dbConnect.js';
import legoSetRoutes from './routes/legoSetRoutes.js';
import partRoutes from './routes/partRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler, notFound } from './utils/customErrorHandler.js';

dotenv.config({ path: './backend/config/config.env' });

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
	cors({
		origin: process.env.FRONTEND_URL || '*',
		credentials: true,
	})
);
app.use(
	express.json({
		limit: '10mb',
	})
);
app.use(
	express.urlencoded({
		extended: true,
		limit: '10mb',
	})
);

// API Routes
app.use('/api', legoSetRoutes);
app.use('/api', partRoutes);
app.use('/api', orderRoutes);

// Serve frontend (Vite build) in production
if (process.env.NODE_ENV === 'production') {
	const distPath = path.join(__dirname, '../frontend/dist');
	if (fs.existsSync(distPath)) {
		app.use(express.static(distPath));

		// Catch-all route (React Router)
		app.get(/^\/(?!api).*/, (req, res) => {
			res.sendFile(path.join(distPath, 'index.html'));
		});
	} else {
		console.error('Build folder not found:', distPath);
	}
}

// Error handlers
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
	try {
		await dbConnect();
		app.listen(PORT, () =>
			console.log(
				`Server running on port ${PORT} (${process.env.NODE_ENV})`
			)
		);
	} catch (err) {
		console.error('Database connection failed:', err.message);
		process.exit(1);
	}
};

startServer();
