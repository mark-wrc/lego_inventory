export class customErrorHandler extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.constructor);
	}
}

export const notFound = (req, res, next) => {
	const error = new customErrorHandler(`Not Found - ${req.originalUrl}`, 404);
	next(error);
};

export const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		success: false,
		message: err.message || 'Internal Server Error',
	});
};
