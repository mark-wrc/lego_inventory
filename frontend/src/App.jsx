import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LegoSets from './pages/LegoSets';
import SetDetails from './components/SetDetails';
import Orders from './pages/Orders'; // import Orders page
import OrderDetails from './pages/OrderDetails.jsx'; // optional, if you create details page
import Parts from './pages/Parts.jsx';
import PartDetails from './components/PartDetails.jsx';

const App = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	return (
		<div className='flex h-screen bg-gray-100'>
			<Sidebar isOpen={isSidebarOpen} />
			<div className='flex flex-col flex-1 transition-all duration-300'>
				<Header
					toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
				/>
				<main className='pt-2 bg-slate-200 overflow-y-auto'>
					<Routes>
						<Route
							index
							element={<Home />}
						/>
						<Route
							path='/legosets'
							element={<LegoSets />}
						/>
						<Route
							path='/set/:id'
							element={<SetDetails />}
						/>
						<Route
							path='/parts'
							element={<Parts />}
						/>
						<Route
							path='/part/:id'
							element={<PartDetails />}
						/>

						<Route
							path='/orders'
							element={<Orders />}
						/>
						<Route
							path='/orders/:id'
							element={<OrderDetails />}
						/>
						<Route
							path='/orders'
							element={<Orders />}
						/>
						<Route
							path='/orders/:id'
							element={<OrderDetails />}
						/>
					</Routes>
				</main>
			</div>
		</div>
	);
};

export default App;
