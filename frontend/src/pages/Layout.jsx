import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Layout = ({ children, isSidebarOpen, setIsSidebarOpen }) => {
	return (
		<div className='flex h-screen bg-gray-100 max-w-full'>
			{/* Sidebar */}
			<Sidebar isOpen={isSidebarOpen} />

			{/* Main content */}
			<div className='flex flex-col flex-1 transition-all duration-300'>
				<Header
					toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
				/>

				<main className='pt-2 bg-slate-200 overflow-y-auto overflow-x-hidden flex-1'>
					{React.cloneElement(children, {
						sidebarOpen: isSidebarOpen,
					})}
				</main>
			</div>
		</div>
	);
};

export default Layout;
