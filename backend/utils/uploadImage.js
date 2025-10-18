import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: 'backend/config/config.env' });

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Standard image upload function that handles any image upload
export const uploadImage = (file, folder) => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.upload(
			file,
			{
				resource_type: 'image',
				folder: folder,
				quality: 'auto',
				fetch_format: 'auto',
			},
			(error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve({
						public_id: result.public_id,
						url: result.url,
					});
				}
			}
		);
	});
};

// Standard function to delete any image
export const deleteImage = async (publicId) => {
	try {
		const res = await cloudinary.uploader.destroy(publicId);
		return res.result === 'ok';
	} catch (error) {
		throw new Error(`Failed to delete the image: ${error.message}`);
	}
};
