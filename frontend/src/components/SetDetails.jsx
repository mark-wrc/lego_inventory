import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import {
	useGetSetByIdQuery,
	useUpdateSetMutation,
	useDeleteSetMutation,
	useUpdateSetImageMutation,
} from '../redux/apiSlice.js';
import { useUpdatePartMutation } from '../redux/partSlice.js';

const SetDetails = ({ sidebarOpen }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { darkMode } = useTheme();

	const { data: setData, isLoading, error } = useGetSetByIdQuery(id);
	const [updateParts] = useUpdatePartMutation();
	const [updateSet] = useUpdateSetMutation();
	const [deleteSet] = useDeleteSetMutation();

	const [parts, setParts] = useState([]);
	const [originalParts, setOriginalParts] = useState([]);
	const [editingCell, setEditingCell] = useState(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [invalidCells, setInvalidCells] = useState(new Set());
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const rowsPerPage = 20;
	const numericFields = ['quantity', 'ordered', 'inventory'];

	// Update Image
	const [updateSetImage] = useUpdateSetImageMutation();
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);

	// Track editable legoSet fields (currently just description)
	const [legoDescription, setLegoDescription] = useState('');

	useEffect(() => {
		if (setData?.data) {
			const clonedParts = JSON.parse(JSON.stringify(setData.data.parts));
			setParts(clonedParts);
			setOriginalParts(clonedParts);
			setLegoDescription(setData.data.setDescription || '');
		}
	}, [setData]);

	if (isLoading) return <p className='p-6'>Loading...</p>;
	if (error || !setData?.data)
		return <p className='p-6 text-red-500'>Set not found!</p>;

	const set = setData.data;
	const totalPages = Math.ceil(parts.length / rowsPerPage);
	const startIndex = (currentPage - 1) * rowsPerPage;
	const currentParts = parts.slice(startIndex, startIndex + rowsPerPage);

	const isRowModified = (rowIndex) =>
		JSON.stringify(parts[rowIndex]) !==
		JSON.stringify(originalParts[rowIndex]);

	const handleCellClick = (rowIndex, field) => {
		setEditingCell({ rowIndex, field });
	};

	const handleInputChange = (rowIndex, field, value) => {
		setParts((prevParts) =>
			prevParts.map((p, i) => {
				if (i !== rowIndex) return p;
				const updated = { ...p };
				if (numericFields.includes(field)) {
					const num = Number(value);
					if (isNaN(num) || num < 0) {
						setInvalidCells((prev) =>
							new Set(prev).add(`${i}-${field}`)
						);
					} else {
						setInvalidCells((prev) => {
							const copy = new Set(prev);
							copy.delete(`${i}-${field}`);
							return copy;
						});
						updated[field] = num;
					}
				} else {
					updated[field] = value;
				}
				return updated;
			})
		);
		setHasChanges(true);
	};

	// Handle Save: update both LegoSet and modified parts
	const handleSave = async () => {
		if (invalidCells.size > 0) {
			alert('Please fix invalid numeric fields before saving.');
			return;
		}

		try {
			let updatedSomething = false;

			// 1️⃣ Check if LegoSet description changed
			const isSetModified = legoDescription !== set.setDescription;
			if (isSetModified) {
				const setPayload = {
					id: set._id,
					setDescription: legoDescription,
				};
				//console.log('➡️ Request to update Lego set:', setPayload);
				await updateSet(setPayload).unwrap();
				//console.log('⬅️ Response from updateSet:', setRes);
				updatedSomething = true;
			}

			// 2️⃣ Check modified parts
			const modifiedParts = parts.filter((p, i) => {
				const original = originalParts[i];
				return JSON.stringify(p) !== JSON.stringify(original);
			});

			if (modifiedParts.length > 0) {
				for (const part of modifiedParts) {
					const partPayload = { id: part._id, ...part };
					//console.log('➡️ Request to update part:', partPayload);
					await updateParts(partPayload).unwrap();
					//console.log('⬅️ Response from updateParts:', partRes);
				}
				updatedSomething = true;
			}

			if (!updatedSomething) {
				alert('No changes detected.');
				return;
			}

			alert('✅ Updates saved successfully!');
			setHasChanges(false);
			setEditingCell(null);
			setOriginalParts(JSON.parse(JSON.stringify(parts))); // refresh snapshot
		} catch (err) {
			//console.error('❌ Update failed:', err);
			alert('Failed to update Lego set or parts.');
		}
	};

	// Handle Delete
	const handleDelete = async () => {
		try {
			await deleteSet(set._id).unwrap();
			alert('Set deleted successfully!');
			navigate('/legosets');
		} catch (err) {
			//console.error(err);
			alert('Failed to delete set.');
		}
	};

	// Handle Image Upload
	const handleLegoSetImageUpload = () => {
		if (!selectedImage) return alert('Please select an image.');

		const reader = new FileReader();
		reader.readAsDataURL(selectedImage);
		reader.onloadend = async () => {
			try {
				await updateSetImage({
					id: set._id,
					image: reader.result,
				}).unwrap();
				alert('Image updated successfully!');
				setIsImageModalOpen(false);
				setSelectedImage(null);
			} catch (err) {
				console.error(err);
				alert('Failed to update image.');
			}
		};
	};

	const columns = [
		{ key: 'item_id', label: 'Item ID' },
		{ key: 'part_id', label: 'Part ID' },
		{ key: 'name', label: 'Name' },
		{ key: 'item_description', label: 'Description' },
		{ key: 'PaB', label: 'PaB' },
		{ key: 'color', label: 'Color' },
		{ key: 'weight', label: 'Weight' },
		{ key: 'US', label: 'US' },
		{ key: 'quantity', label: 'Quantity' },
		{ key: 'ordered', label: 'Ordered' },
		{ key: 'inventory', label: 'Inventory' },
		{ key: 'bsStandard', label: 'BS/Standard' },
	];

	return (
		<div
			className={`transition-all duration-300 min-h-screen ${
				darkMode
					? 'bg-gray-900 text-gray-100'
					: 'bg-gray-100 text-gray-900'
			}`}
		>
			<div className='p-6'>
				{/* Top Buttons */}
				<div className='flex flex-col sm:flex-row justify-between mb-6 gap-2'>
					<button
						onClick={() => navigate(-1)}
						className={`px-3 py-2 rounded ${
							darkMode
								? 'bg-gray-700 text-white hover:bg-gray-600'
								: 'bg-indigo-500 text-white hover:bg-indigo-600'
						}`}
					>
						← Back
					</button>
					<button
						onClick={() => setIsDeleteModalOpen(true)}
						className={`px-4 py-2 rounded-lg font-semibold shadow-md ${
							darkMode
								? 'bg-red-600 hover:bg-red-500'
								: 'bg-red-500 hover:bg-red-600'
						} text-white`}
					>
						Delete Set
					</button>
				</div>

				{/* Set Info Card */}
				<div className='flex flex-col md:flex-row gap-6 mb-6 items-start'>
					{console.log('SET DATA:', set)}
					<img
						src={set.setImage?.url}
						alt={set.setName}
						className='w-full md:w-64 h-56 object-cover rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700 cursor-pointer'
						onDoubleClick={() => setIsImageModalOpen(true)}
					/>
					<div
						className={`flex-1 p-5 md:p-6 rounded-3xl shadow-xl ${
							darkMode ? 'bg-gray-800' : 'bg-white'
						}`}
					>
						<h2 className='text-3xl font-bold mb-3'>
							{set.setName}
						</h2>
						<p className='text-lg mb-2'>
							Description:{' '}
							{editingCell?.setDescription ? (
								<input
									type='text'
									value={legoDescription}
									onChange={(e) => {
										setLegoDescription(e.target.value);
										setHasChanges(true);
									}}
									onBlur={() => setEditingCell(null)}
									autoFocus
									className='w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500'
								/>
							) : (
								<span
									className='px-2 cursor-pointer'
									onDoubleClick={() =>
										setEditingCell({ setDescription: true })
									}
								>
									{legoDescription || '-'}
								</span>
							)}
						</p>
						<p className='text-lg mb-2'>
							Total Parts:{' '}
							<span className='font-semibold px-2'>
								{parts.length}
							</span>
						</p>
						<p className='text-gray-500 dark:text-gray-300'>
							Double-click on description or table cells to edit.
						</p>
					</div>
				</div>

				{/* Table */}
				<div className='overflow-x-auto rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg'>
					<table className='min-w-[900px] w-full border-collapse'>
						<thead
							className={`sticky top-0 z-10 ${
								darkMode
									? 'bg-gray-800 text-gray-200'
									: 'bg-gray-100 text-gray-700'
							}`}
						>
							<tr>
								{columns.map((col) => (
									<th
										key={col.key}
										className='px-4 py-3 text-left border-b border-gray-400'
									>
										{col.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{currentParts.map((part, rowIndex) => {
								const absoluteRow = startIndex + rowIndex;
								return (
									<tr
										key={rowIndex}
										className={`${
											isRowModified(absoluteRow)
												? 'bg-yellow-100 dark:bg-yellow-800'
												: rowIndex % 2 === 0
												? darkMode
													? 'bg-gray-900'
													: 'bg-white'
												: darkMode
												? 'bg-gray-800'
												: 'bg-gray-50'
										} hover:bg-indigo-100 dark:hover:bg-indigo-700 transition`}
									>
										{columns.map(({ key }) => {
											const isCellEditing =
												editingCell?.rowIndex ===
													absoluteRow &&
												editingCell?.field === key;
											const isInvalid = invalidCells.has(
												`${absoluteRow}-${key}`
											);

											return (
												<td
													key={key}
													className={`px-3 py-2 border ${
														darkMode
															? 'border-gray-700'
															: 'border-gray-300'
													} cursor-pointer`}
													onDoubleClick={() =>
														handleCellClick(
															absoluteRow,
															key
														)
													}
												>
													{isCellEditing ? (
														key === 'bsStandard' ? (
															<select
																value={
																	part[key] ||
																	''
																}
																onChange={(e) =>
																	handleInputChange(
																		absoluteRow,
																		key,
																		e.target
																			.value
																	)
																}
																onBlur={() =>
																	setEditingCell(
																		null
																	)
																}
																autoFocus
																className='w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500'
															>
																<option value=''>
																	Select
																</option>
																<option value='BS'>
																	BS
																</option>
																<option value='Standard'>
																	Standard
																</option>
															</select>
														) : (
															<input
																type={
																	numericFields.includes(
																		key
																	)
																		? 'number'
																		: 'text'
																}
																value={
																	part[key] ??
																	''
																}
																onChange={(e) =>
																	handleInputChange(
																		absoluteRow,
																		key,
																		e.target
																			.value
																	)
																}
																onBlur={() =>
																	setEditingCell(
																		null
																	)
																}
																autoFocus
																className={`w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
																	isInvalid
																		? 'border-red-500'
																		: ''
																}`}
															/>
														)
													) : (
														part[key] ?? '-'
													)}
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Pagination & Save */}
				<div className='flex justify-between items-center mt-4 flex-wrap gap-2'>
					<div className='flex items-center gap-2 text-sm'>
						Page {currentPage} of {totalPages}
						<button
							onClick={() =>
								setCurrentPage((p) => Math.max(p - 1, 1))
							}
							disabled={currentPage === 1}
							className='px-3 py-1 rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition'
						>
							Prev
						</button>
						<button
							onClick={() =>
								setCurrentPage((p) =>
									Math.min(p + 1, totalPages)
								)
							}
							disabled={currentPage === totalPages}
							className='px-3 py-1 rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition'
						>
							Next
						</button>
					</div>
					{hasChanges && (
						<button
							onClick={handleSave}
							className='px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition'
						>
							Save Changes
						</button>
					)}
				</div>

				{/* Delete Modal */}
				{isDeleteModalOpen && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
						<div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-11/12 sm:w-96 p-6'>
							<h3 className='text-xl font-semibold mb-4'>
								Confirm Delete
							</h3>
							<p className='mb-4'>
								Are you sure you want to delete{' '}
								<span className='font-semibold'>
									{set.setName}
								</span>
								?
							</p>
							<div className='flex justify-end gap-3'>
								<button
									onClick={() => setIsDeleteModalOpen(false)}
									className='px-5 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition'
								>
									Cancel
								</button>
								<button
									onClick={handleDelete}
									className='px-5 py-2 rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md transition'
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				)}

				{isImageModalOpen && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
						<div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-11/12 sm:w-96 p-6'>
							<h3 className='text-xl font-semibold mb-4'>
								Update Set Image
							</h3>
							<input
								type='file'
								accept='image/*'
								onChange={(e) =>
									setSelectedImage(e.target.files[0])
								}
								className='mb-4'
							/>
							<div className='flex justify-end gap-3'>
								<button
									onClick={() => {
										setIsImageModalOpen(false);
										setSelectedImage(null);
									}}
									className='px-5 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition'
								>
									Cancel
								</button>
								<button
									onClick={handleLegoSetImageUpload}
									className='px-5 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition'
								>
									Upload
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SetDetails;
