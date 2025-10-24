import React, { useEffect } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
	const { darkMode, toggleTheme } = useTheme();
	const navigate = useNavigate();

	return (
		<header className='flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md'>
			{/* Sidebar toggle */}
			<button
				onClick={toggleSidebar}
				className='text-gray-700 dark:text-gray-100'
			>
				<Menu size={24} />
			</button>

			{/* Dashboard title */}
			<h1 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
				Dashboard
			</h1>

			{/* Right section: theme toggle + login */}
			<div className='flex items-center gap-4'>
				{/* Theme toggle */}
				<button
					onClick={toggleTheme}
					className='flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-shadow shadow-sm'
					title='Toggle Light/Dark Mode'
				>
					{darkMode ? <Sun size={20} /> : <Moon size={20} />}
				</button>

				{/* Minimalist Elegant Login button */}
				<button
					onClick={() => navigate('/login')}
					className='px-5 py-2 rounded-lg font-medium bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition transform hover:-translate-y-0.5'
				>
					Login
				</button>
			</div>
		</header>
	);
};

export default Header;
