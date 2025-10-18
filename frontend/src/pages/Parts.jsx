import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useGetPartsQuery } from '../redux/partSlice.js';
import { useNavigate } from 'react-router-dom';

const Parts = () => {
	const { darkMode } = useTheme();
	const { data: partsData, isLoading, error } = useGetPartsQuery();
	const navigate = useNavigate();

	if (isLoading) {
		return <p className='p-6 text-center'>Loading parts...</p>;
	}

	if (error) {
		return (
			<p className='p-6 text-center text-red-500'>Failed to load parts</p>
		);
	}

	const parts = partsData?.data || [];

	const handleCardClick = (id) => {
		navigate(`/part/${id}`);
	};

	return (
		<div className='p-6'>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
				{parts.map((part) => (
					<div
						key={part._id}
						className={`rounded-2xl shadow-lg overflow-hidden transition transform hover:scale-105 cursor-pointer ${
							darkMode
								? 'bg-gray-800 text-gray-100'
								: 'bg-white text-gray-900'
						}`}
						onClick={() => handleCardClick(part._id)}
					>
						<div className='w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
							{part.partImage?.url ? (
								<img
									src={part.partImage.url}
									alt={part.name}
									className='w-full h-full object-cover'
								/>
							) : (
								<span className='text-gray-500 dark:text-gray-400'>
									No Image
								</span>
							)}
						</div>
						<div className='p-4'>
							<h3 className='text-lg font-semibold'>
								{part.name}
							</h3>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Part ID: {part.part_id}
							</p>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Quantity: {part.quantity || 0}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Parts;
