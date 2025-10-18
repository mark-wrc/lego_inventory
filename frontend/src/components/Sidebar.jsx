import React from 'react';
import { Home, BarChart2, Settings, Package, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ icon, label, isOpen, to }) => (
	<Link to={to}>
		<div className='flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer'>
			<div className='text-gray-300'>{icon}</div>
			{isOpen && <span className='ml-3'>{label}</span>}
		</div>
	</Link>
);

const Sidebar = ({ isOpen }) => (
	<div
		className={`${
			isOpen ? 'w-64' : 'w-20'
		} bg-gray-800 text-gray-100 h-screen transition-all duration-300 flex flex-col`}
	>
		<div className='flex items-center justify-center py-4 border-b border-gray-700'>
			<span className='text-2xl font-bold'>
				{isOpen ? 'MyDash' : 'MD'}
			</span>
		</div>

		<nav className='flex-1 mt-4 space-y-2'>
			<SidebarItem
				icon={<Home size={20} />}
				label='Home'
				isOpen={isOpen}
				to='/'
			/>
			<SidebarItem
				icon={<BarChart2 size={20} />}
				label='Lego Sets'
				isOpen={isOpen}
				to='/legosets'
			/>
			<SidebarItem
				icon={<Box size={20} />}
				label='Parts'
				isOpen={isOpen}
				to='/parts'
			/>
			<SidebarItem
				icon={<Package size={20} />}
				label='Orders'
				isOpen={isOpen}
				to='/orders'
			/>
			<SidebarItem
				icon={<Settings size={20} />}
				label='Settings'
				isOpen={isOpen}
				to='/settings'
			/>
		</nav>

		<div className='p-4 text-center text-sm text-gray-400 border-t border-gray-700'>
			{isOpen ? '© 2025 MyDashboard' : '©'}
		</div>
	</div>
);

export default Sidebar;
