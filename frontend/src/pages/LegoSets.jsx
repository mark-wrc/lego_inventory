import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useGetLegoSetsQuery, useCreateSetMutation } from '../redux/apiSlice';

const LegoSets = () => {
	const { darkMode } = useTheme();
	const { data, isLoading, error } = useGetLegoSetsQuery();
	const [createSet, { isLoading: isCreating }] = useCreateSetMutation();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [setName, setSetName] = useState('');
	const [file, setFile] = useState(null);

	/* 	useEffect(() => {
		if (data) console.log('RTK Query data:', data);
	}, [data]);
 */
	const legoSets = data?.data || [];

	const handleCreate = async () => {
		if (!setName || !file) {
			alert('Please provide a set name and upload a file.');
			return;
		}

		try {
			const dataBuffer = await file.arrayBuffer();
			const workbook = XLSX.read(dataBuffer);
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];
			const parts = XLSX.utils.sheet_to_json(sheet);

			console.log('Checking Parts:', parts);

			const mappedParts = parts.map((p, index) => ({
				item_id: p.item_id || index + 1,
				part_id: p.part_id || '',
				name: p.name || '',
				item_description: p.item_description || '',
				PaB: p.PaB || 0,
				color: p.Color || '',
				weight: p.Weight || '',
				US: p['US Price']
					? parseFloat(p['US Price'].replace(/[^0-9.]+/g, '')) || 0
					: 0,
				quantity: p.Quantity || 0,
				ordered: p.Ordered || 0,
				inventory: p.Inventory || 0,
				bsStandard: p['BS/Standard'] || '',
			}));

			await createSet({
				setName,
				image: 'https://via.placeholder.com/300x200?text=New+Set',
				parts: mappedParts,
			}).unwrap();

			setIsModalOpen(false);
			setSetName('');
			setFile(null);
			document.getElementById('fileInput').value = '';
		} catch (err) {
			//console.error('Failed to create set:', err);
			alert('Failed to create Lego set.');
		}
	};

	if (isLoading) return <p className='p-6'>Loading Lego sets...</p>;

	if (error) {
		//console.error('RTK Query error:', error);
		let errorMessage = 'Failed to fetch Lego sets.';
		if (error.data)
			errorMessage = error.data.message || JSON.stringify(error.data);
		else if (error.error) errorMessage = error.error;
		return <p className='p-6 text-red-500'>{errorMessage}</p>;
	}

	return (
		<div
			className={`p-6 ${
				darkMode
					? 'bg-gray-900 text-gray-100'
					: 'bg-gray-100 text-gray-900'
			} min-h-screen`}
		>
			{/* Heading */}
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-2xl font-semibold tracking-wide'>
					All Lego Sets
				</h2>
				<button
					onClick={() => setIsModalOpen(true)}
					className='flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-md transition duration-300'
				>
					<Plus
						size={20}
						className='mr-2'
					/>
					Create Set
				</button>
			</div>

			{/* Show cards only if there are sets */}
			{legoSets.length === 0 ? (
				<p className='p-6 text-gray-500'>No Lego sets available.</p>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{legoSets.map((set) => (
						<Link
							key={set._id || set.id}
							to={`/set/${set._id || set.id}`}
							className={`relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
						>
							{/* Image with gradient overlay */}
							<div className='relative'>
								<img
									src={set.setImage?.url}
									alt={set.setName}
									className='w-full h-48 object-cover'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent'></div>
							</div>

							{/* Card info */}
							<div className='p-4'>
								<h3 className='text-lg font-bold mb-1'>
									{set.setName}
								</h3>
								<p className='text-sm text-gray-500 dark:text-gray-300 mb-2'>
									Set ID: {set.setId}
								</p>
								<p className='text-sm font-medium text-indigo-600 dark:text-indigo-400'>
									Total Parts: {set.parts.length}
								</p>
							</div>
						</Link>
					))}
				</div>
			)}

			{/* Create Modal */}
			{isModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-96 p-6'>
						<h3 className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100'>
							Create New Lego Set
						</h3>
						<div className='flex flex-col gap-4'>
							<input
								type='text'
								placeholder='Set Name'
								value={setName}
								onChange={(e) => setSetName(e.target.value)}
								className='px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500'
							/>
							<label
								htmlFor='fileInput'
								className='flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer text-gray-700 dark:text-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-sm'
							>
								{file ? file.name : 'Upload Excel/CSV File'}
							</label>
							<input
								type='file'
								id='fileInput'
								accept='.xls,.xlsx,.csv'
								onChange={(e) => {
									const selectedFile = e.target.files?.[0];
									if (selectedFile) setFile(selectedFile);
								}}
								className='hidden'
							/>
							<div className='flex justify-end gap-3 mt-4'>
								<button
									onClick={() => {
										setIsModalOpen(false);
										setFile(null);
										setSetName('');
										document.getElementById(
											'fileInput'
										).value = '';
									}}
									className='px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm'
								>
									Cancel
								</button>
								<button
									onClick={handleCreate}
									disabled={isCreating} // disable while request is in progress
									className={`px-5 py-2 rounded-lg text-white shadow-md transition
		bg-gradient-to-r from-indigo-500 to-purple-500
		hover:from-indigo-600 hover:to-purple-600
		${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
								>
									{isCreating ? 'Creating...' : 'Create'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LegoSets;
