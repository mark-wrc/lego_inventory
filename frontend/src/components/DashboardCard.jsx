import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const DashboardCard = ({ title, value, onClick }) => {
	const { darkMode } = useTheme();

	return (
		<div
			onClick={onClick} // ✅ make card clickable
			className={`p-6 rounded-xl shadow-md transition-transform transform hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
				darkMode
					? 'bg-gray-800 text-gray-100'
					: 'bg-white text-gray-800'
			}`}
		>
			<h3 className='text-sm text-gray-400'>{title}</h3>
			<p className='text-2xl font-bold mt-2'>{value}</p>
		</div>
	);
};

export default DashboardCard;
