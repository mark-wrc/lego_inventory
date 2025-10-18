import React from 'react';
import DashboardCard from '../components/DashboardCard.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useGetLegoSetsQuery } from '../redux/apiSlice.js';
import { useGetPartsQuery } from '../redux/partSlice.js';
import { useGetAllOrdersQuery } from '../redux/orderSlice.jsx';
import { useNavigate } from 'react-router-dom';

const Home = ({ user }) => {
	const { darkMode } = useTheme();
	const navigate = useNavigate(); // ✅ for navigation

	// RTK Query calls
	const { data: legoSets, isLoading: loadingSets } = useGetLegoSetsQuery();
	const { data: parts, isLoading: loadingParts } = useGetPartsQuery();
	const { data: orders, isLoading: loadingOrders } = useGetAllOrdersQuery();

	// Show loading if any query is still fetching
	if (loadingSets || loadingParts || loadingOrders) {
		return <div className='p-6'>Loading dashboard...</div>;
	}

	// Calculate totals safely
	const totalSets = legoSets?.data?.length || 0;
	const totalParts = parts?.data?.length || 0;
	const totalOrders = orders?.orders.length || 0;

	// Handlers
	const handleGetStarted = () => navigate('/legosets');
	const handleCardClick = (type) => {
		switch (type) {
			case 'legoSets':
				navigate('/legosets');
				break;
			case 'parts':
				navigate('/parts');
				break;
			case 'orders':
				navigate('/orders');
				break;
			default:
				break;
		}
	};

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
				<button
					onClick={handleGetStarted} // ✅ navigate to /legosets
					className='mt-4 sm:mt-0 px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 hover:shadow-lg transition transform hover:-translate-y-1'
				>
					Get Started
				</button>
			</div>

			{/* Dashboard Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer'>
				<DashboardCard
					className='cursor-pointer'
					title='Total Lego Sets'
					value={totalSets}
					onClick={() => handleCardClick('legoSets')} // ✅ navigate to /legosets
				/>
				<DashboardCard
					className='cursor-pointer'
					title='Total Parts'
					value={totalParts}
					onClick={() => handleCardClick('parts')} // ✅ navigate to /parts
				/>
				<DashboardCard
					className='cursor-pointer'
					title='Orders'
					value={totalOrders}
					onClick={() => handleCardClick('orders')} // ✅ navigate to /orders
				/>
			</div>
		</div>
	);
};

export default Home;
