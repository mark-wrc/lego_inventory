import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout.jsx';
import Home from './pages/Home';
import LegoSets from './pages/LegoSets';
import SetDetails from './components/SetDetails';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails.jsx';
import Parts from './pages/Parts.jsx';
import PartDetails from './components/PartDetails.jsx';

const App = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	return (
		<Routes>
			<Route
				path='/'
				element={
					<Layout
						isSidebarOpen={isSidebarOpen}
						setIsSidebarOpen={setIsSidebarOpen}
					>
						<Home />
					</Layout>
				}
			/>
			<Route
				path='/legosets'
				element={
					<Layout
						isSidebarOpen={isSidebarOpen}
						setIsSidebarOpen={setIsSidebarOpen}
					>
						<LegoSets />
					</Layout>
				}
			/>
			<Route
				path='/set/:id'
				element={
					<Layout
						isSidebarOpen={isSidebarOpen}
						setIsSidebarOpen={setIsSidebarOpen}
					>
						<SetDetails />
					</Layout>
				}
			/>
			<Route
				path='/parts'
				element={
					<Layout
						isSidebarOpen={isSidebarOpen}
						setIsSidebarOpen={setIsSidebarOpen}
					>
						<Parts />
					</Layout>
				}
			/>
			<Route
				path='/part/:id'
				element={
					<Layout
						isSidebarOpen={isSidebarOpen}
						setIsSidebarOpen={setIsSidebarOpen}
					>
						<PartDetails />
					</Layout>
				}
			/>
			<Route
				path='/orders'
				element={
					<Layout
						isSidebarOpen={isSidebarOpen}
						setIsSidebarOpen={setIsSidebarOpen}
					>
						<Orders />
					</Layout>
				}
			/>
			<Route
				path='/orders/:id'
				element={
					<Layout
						isSidebarOpen={isSidebarOpen}
						setIsSidebarOpen={setIsSidebarOpen}
					>
						<OrderDetails />
					</Layout>
				}
			/>
		</Routes>
	);
};

export default App;
