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

const PORT = process.env.PORT || 5000;
dotenv.config({ path: './backend/config/config.env' });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'Production') {
	try {
		const distDir = path.join(__dirname, '../frontend/dist');
		const indexFile = path.resolve(distDir, 'index.html');

		// console.log('🔧 [STATIC SETUP] Production mode');
		// console.log('📁 Static files directory:', distDir);
		// console.log('📄 Index file path:', indexFile);

		if (!fs.existsSync(distDir)) {
			console.error('❌ dist directory NOT found:', distDir);
		} else if (!fs.existsSync(indexFile)) {
			console.error('❌ index.html NOT found:', indexFile);
		} else {
			console.log('✅ dist and index.html found.');
			app.use(express.static(distDir));
			console.log('🚀 Static middleware registered.');

			// ✅ Catch-all route (safe for Express 5) to support frontend routing like /verify_user/:token
			app.use((req, res, next) => {
				if (req.method === 'GET' && !req.path.startsWith('/api/')) {
					console.log(
						`📨 Serving index.html for unmatched path: ${req.path}`
					);
					return res.sendFile(indexFile);
				}
				next(); // Let 404 middleware handle other cases
			});
		}
	} catch (error) {
		console.error('🔥 Error during static file setup:', error);
	}
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
