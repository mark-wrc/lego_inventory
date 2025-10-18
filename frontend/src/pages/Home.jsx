import React, { useEffect, useState } from 'react';
import { legoSets } from '../data/legoSetsData';
import { orders } from '../data/ordersData';
import DashboardCard from '../components/DashboardCard.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const Home = ({ user }) => {
	const { darkMode } = useTheme();

	const [totalOrders, setTotalOrders] = useState(0);
	const [totalSets, setTotalSets] = useState(0);

	useEffect(() => {
		setTotalOrders(orders.length);
		setTotalSets(legoSets.length);
	}, []);

	return (
		<div className='p-6 min-h-screen'>
			{/* Welcome Section */}
			<div
				className={`mb-8 p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-center transition-transform transform hover:scale-[1.01] ${
					darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'
				}`}
			>
				<div>
					<h2 className='text-3xl font-bold mb-2'>
						{user?.firstName
							? `Welcome Back, ${user.firstName}!`
							: 'Welcome to Dashboard!'}
					</h2>
					<p className='text-gray-400'>
						Manage your account, track your stats, and get insights.
					</p>
				</div>
				<button className='mt-4 sm:mt-0 px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 hover:shadow-lg transition transform hover:-translate-y-1'>
					Get Started
				</button>
			</div>

			{/* Dashboard Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6'>
				<DashboardCard
					title='Total Lego Sets'
					value={totalSets}
				/>
				<DashboardCard
					title='Orders'
					value={totalOrders}
				/>
			</div>
		</div>
	);
};

export default Home;
