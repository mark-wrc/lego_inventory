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
	const [updateSetImage] = useUpdateSetImageMutation();

	const [parts, setParts] = useState([]);
	const [originalParts, setOriginalParts] = useState([]);
	const [editingPartCell, setEditingPartCell] = useState(null); // { rowIndex, field }
	const [editingDescription, setEditingDescription] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [invalidCells, setInvalidCells] = useState(new Set());
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	// New numeric fields: numberOfSets, x, y
	const [numberOfSets, setNumberOfSets] = useState(1);
	const [xValue, setXValue] = useState(1);
	const [yValue, setYValue] = useState(1);
	const [editingField, setEditingField] = useState(null); // 'numberOfSets' | 'x' | 'y' | null
	const [invalidFields, setInvalidFields] = useState(new Set());

	const [currentPage, setCurrentPage] = useState(1);
	const rowsPerPage = 20;
	const numericFields = ['quantity', 'ordered', 'inventory'];

	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [legoDescription, setLegoDescription] = useState('');

	// Load set data into state

	useEffect(() => {
		if (setData?.data) {
			const clonedParts = JSON.parse(
				JSON.stringify(setData.data.parts || [])
			);
			setParts(clonedParts);
			setOriginalParts(clonedParts);
			setLegoDescription(setData.data.setDescription || '');

			// initialize numeric fields from backend if present (fallback to defaults)
			setNumberOfSets(
				typeof setData.data.numberOfSets === 'number'
					? setData.data.numberOfSets
					: 1
			);
			setXValue(
				typeof setData.data.xValue === 'number'
					? setData.data.xValue
					: 1
			);
			setYValue(
				typeof setData.data.yValue === 'number'
					? setData.data.yValue
					: 1
			);
		}
	}, [setData]);

	if (isLoading) return <p className='p-6'>Loading...</p>;
	if (error || !setData?.data)
		return <p className='p-6 text-red-500'>Set not found!</p>;

	const set = setData.data;
	const totalPages = Math.ceil(parts.length / rowsPerPage) || 1;
	const startIndex = (currentPage - 1) * rowsPerPage;
	const currentParts = parts.slice(startIndex, startIndex + rowsPerPage);

	const editableFields = [
		'name',
		'color',
		'quantity',
		'item_description',
		'inventory',
		'ordered',
		'needed',
		'worldPrice',
		'usPrice',
		'pabPrice',
		'bsStandard',
		'cost',
		'costPrice_y',
		'weight',
		'salesPrice',
	];

	const isRowModified = (rowIndex) => {
		// guard if originalParts length doesn't match
		if (!originalParts[rowIndex]) return false;
		return editableFields.some(
			(field) => parts[rowIndex][field] !== originalParts[rowIndex][field]
		);
	};

	const handleCellClick = (rowIndex, field) =>
		setEditingPartCell({ rowIndex, field });

	const handleInputChange = (rowIndex, field, value) => {
		setParts((prevParts) =>
			prevParts.map((p, i) => {
				if (i !== rowIndex) return p;

				const updated = { ...p };

				// Handle numeric fields
				if (numericFields.includes(field)) {
					if (value === '') {
						setInvalidCells((prev) =>
							new Set(prev).add(`${i}-${field}`)
						);
					} else {
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
					}
				} else {
					updated[field] = value;
				}

				// --- Auto-update pabPrice_x whenever PaB changes ---
				if (field === 'PaB') {
					updated.pabPrice_x = (
						(Number(value) || 0) * xValue
					).toFixed(2);
				}

				return updated;
			})
		);
		setHasChanges(true);
	};

	const handleSave = async () => {
		// 1️⃣ Validation
		if (invalidCells.size > 0 || invalidFields.size > 0) {
			return alert('Please fix invalid numeric fields before saving.');
		}

		try {
			let updatedSomething = false;
			const setPayload = { id: set._id };
			let shouldUpdateSet = false;
			let topFieldChanged = false; // track if numberOfSets, xValue, or yValue changed

			// 2️⃣ Detect LEGO set changes
			if (legoDescription !== set.setDescription) {
				setPayload.setDescription = legoDescription;
				shouldUpdateSet = true;
			}

			if (set.numberOfSets !== numberOfSets) {
				setPayload.numberOfSets = numberOfSets;
				shouldUpdateSet = true;
				topFieldChanged = true;
			}

			if (set.xValue !== xValue) {
				setPayload.xValue = xValue;
				shouldUpdateSet = true;
				topFieldChanged = true;
			}

			if (set.yValue !== yValue) {
				setPayload.yValue = yValue;
				shouldUpdateSet = true;
				topFieldChanged = true;
			}

			// 3️⃣ Update LEGO set if needed
			if (shouldUpdateSet) {
				try {
					await updateSet(setPayload).unwrap();
					updatedSomething = true;
				} catch (err) {}
			}

			// 4️⃣ Determine which parts to update
			let partsToUpdate = [];

			if (topFieldChanged) {
				partsToUpdate = parts.map((part) => ({
					id: part._id,
					...part,
					qSet: (Number(part.quantity) || 0) * (numberOfSets || 1),
					pabPrice_x: (Number(part.PaB) || 0) * (xValue || 1),
					cost: Number(part.cost) || 0,
					costPrice_y: (Number(part.cost) || 0) * (yValue || 1),
				}));
			} else {
				const modifiedParts = parts.filter((p, i) =>
					editableFields.some(
						(field) => p[field] !== originalParts[i]?.[field]
					)
				);

				if (modifiedParts.length > 0) {
					partsToUpdate = modifiedParts.map((p) => ({
						id: p._id,
						...p,
						qSet: (Number(p.quantity) || 0) * (numberOfSets || 1),
						pabPrice_x: (Number(p.PaB) || 0) * (xValue || 1),
						cost: Number(p.cost) || 0,
						costPrice_y: (Number(p.cost) || 0) * (yValue || 1),
					}));
				}
			}

			// 5️⃣ Send part updates
			if (partsToUpdate.length > 0) {
				for (const part of partsToUpdate) {
					try {
						const res = await updateParts(part).unwrap();
						updatedSomething = true;
					} catch (err) {}
				}
			}

			// 6️⃣ Handle no-change case
			if (!updatedSomething) {
				return alert('No changes detected.');
			}

			// 7️⃣ Final success actions
			alert('✅ Updates saved successfully!');
			setHasChanges(false);
			setEditingPartCell(null);
			setEditingDescription(false);
			setOriginalParts(JSON.parse(JSON.stringify(parts)));
		} catch (err) {
			alert('Failed to save changes. Check console for details.');
		}
	};

	const handleDelete = async () => {
		try {
			await deleteSet(set._id).unwrap();
			alert('Set deleted successfully!');
			navigate('/legosets');
		} catch (err) {
			alert('Failed to delete set.');
		}
	};

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
				alert('Failed to update image.');
			}
		};
	};

	const columns = [
		{ key: 'partImage', label: 'Thumbnail' },
		{ key: 'part_id', label: 'Part ID' },
		{ key: 'item_id', label: 'Item ID' },
		{ key: 'name', label: 'Name' },
		{ key: 'color', label: 'Color' },
		{ key: 'quantity', label: 'Quantity' },
		{ key: 'item_description', label: 'Description' },
		{ key: 'qSet', label: 'Q * set' },
		{ key: 'inventory', label: 'Inventory' },
		{ key: 'ordered', label: 'Ordered' },
		{ key: 'needed', label: 'Needed' },
		{ key: 'worldPrice', label: 'World' },
		{ key: 'US', label: 'US' },
		{ key: 'PaB', label: 'PaB' },
		{ key: 'pabPrice_x', label: 'PaB * x' },
		{ key: 'bsStandard', label: 'BS/Standard' },
		{ key: 'cost', label: 'Cost' },
		{ key: 'costPrice_y', label: 'Cost * y' },
		{ key: 'weight', label: 'Weight' },
		{ key: 'salesPrice', label: 'Sales Price' },
	];

	return (
		<div
			className={`transition-all duration-300 min-h-screen ${
				darkMode
					? 'bg-black text-gray-100'
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

				{/* Set Info */}
				<div className='flex flex-col md:flex-row gap-6 mb-6 items-start'>
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

						{/* Description (editable on double-click) */}
						<p className='text-lg mb-2'>
							Description:{' '}
							{editingDescription ? (
								<input
									type='text'
									value={legoDescription}
									onChange={(e) => {
										setLegoDescription(e.target.value);
										setHasChanges(true);
									}}
									onBlur={() => setEditingDescription(false)}
									autoFocus
									className='w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500'
								/>
							) : (
								<span
									className='px-2 cursor-pointer'
									onDoubleClick={() =>
										setEditingDescription(true)
									}
								>
									{legoDescription || '-'}
								</span>
							)}
						</p>

						{/* Total Parts */}
						<p className='text-lg mb-2'>
							Total Parts:{' '}
							<span className='font-semibold px-2'>
								{parts.length * numberOfSets}
							</span>
						</p>

						{/* New numeric editable fields: Number of sets, x, y */}
						<div className='flex flex-col justify-start '>
							{[
								{
									label: 'Number of Sets',
									key: 'numberOfSets',
									value: numberOfSets,
									setter: setNumberOfSets,
								},
								{
									label: 'Value x',
									key: 'xValue',
									value: xValue,
									setter: setXValue,
								},
								{
									label: 'Value y',
									key: 'yValue',
									value: yValue,
									setter: setYValue,
								},
							].map(({ label, key, value, setter }) => {
								const isEditing = editingField === key;
								const isInvalid = invalidFields.has(key);
								return (
									<p
										key={key}
										className='text-lg mb-2'
									>
										{label}:{' '}
										{isEditing ? (
											<input
												type='number'
												min={0}
												value={value}
												autoFocus
												onChange={(e) => {
													const v = e.target.value;
													if (v === '') {
														setInvalidFields(
															(prev) =>
																new Set(
																	prev
																).add(key)
														);
													} else {
														const n = Number(v);
														if (isNaN(n) || n < 0) {
															setInvalidFields(
																(prev) =>
																	new Set(
																		prev
																	).add(key)
															);
														} else {
															setInvalidFields(
																(prev) => {
																	const copy =
																		new Set(
																			prev
																		);
																	copy.delete(
																		key
																	);
																	return copy;
																}
															);
															setter(n);
															setHasChanges(true);
														}
													}
												}}
												onBlur={() =>
													setEditingField(null)
												}
												className={`w-20 px-2 py-1 border rounded text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100 ${
													isInvalid
														? 'border-red-500'
														: 'border-gray-300 dark:border-gray-700'
												}`}
											/>
										) : (
											<span
												className='font-semibold px-2 cursor-pointer dark:text-gray-100'
												onDoubleClick={() =>
													setEditingField(key)
												}
											>
												{value}
											</span>
										)}
									</p>
								);
							})}
						</div>

						<p className='text-gray-500 dark:text-gray-300'>
							Double-click on description, the small fields above,
							or table cells to edit.
						</p>
					</div>
				</div>

				{/* Scrollable Table */}
				<div className='overflow-x-auto rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg'>
					{/* width adjusts using inline style based on sidebarOpen */}
					<div
						className='overflow-x-auto overflow-y-auto rounded-2xl'
						style={{
							width: `calc(100vw - ${
								sidebarOpen ? '15rem' : '8rem'
							})`,
							transition: 'width 0.12s',
						}}
					>
						<table className='w-full border-collapse'>
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
											className='px-4 py-3 text-left border-b border-gray-400 whitespace-nowrap'
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
													editingPartCell?.rowIndex ===
														absoluteRow &&
													editingPartCell?.field ===
														key;
												const isInvalid =
													invalidCells.has(
														`${absoluteRow}-${key}`
													);

												// Thumbnail remains unchanged
												if (key === 'partImage') {
													return (
														<td
															key={key}
															className='px-3 py-2 border cursor-default text-center'
														>
															{part.partImage
																?.url ? (
																<img
																	src={
																		part
																			.partImage
																			.url
																	}
																	alt={
																		part.name ||
																		'Thumbnail'
																	}
																	className='w-16 h-16 object-cover rounded-md mx-auto'
																/>
															) : (
																<span>-</span>
															)}
														</td>
													);
												}

												// Q * set
												if (key === 'qSet') {
													return (
														<td
															key={key}
															className='px-3 py-2 cursor-default'
														>
															{(part.quantity ||
																0) *
																(numberOfSets ||
																	1)}
														</td>
													);
												}

												// PaB * x
												if (key === 'pabPrice_x') {
													const value =
														(Number(part.PaB) ||
															0) * (xValue || 1);
													return (
														<td
															key={key}
															className='px-3 py-2  cursor-default text-center'
														>
															{value.toFixed(2)}
														</td>
													);
												}

												// Cost * y
												if (key === 'costPrice_y') {
													const value =
														(Number(part.cost) ||
															0) * (yValue || 1);
													return (
														<td
															key={key}
															className='px-3 py-2 cursor-default text-center'
														>
															{value.toFixed(2)}
														</td>
													);
												}

												// Editable cells
												return (
													<td
														key={key}
														className={`px-3 py-2 border ${
															darkMode
																? 'border-gray-700'
																: 'border-gray-300'
														} cursor-pointer whitespace-nowrap`}
														onDoubleClick={() =>
															handleCellClick(
																absoluteRow,
																key
															)
														}
													>
														{
															isCellEditing ? (
																key ===
																'bsStandard' ? (
																	<select
																		value={
																			part[
																				key
																			] ||
																			''
																		}
																		onChange={(
																			e
																		) =>
																			handleInputChange(
																				absoluteRow,
																				key,
																				e
																					.target
																					.value
																			)
																		}
																		onBlur={() =>
																			setEditingPartCell(
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
																			part[
																				key
																			] ??
																			''
																		}
																		onChange={(
																			e
																		) =>
																			handleInputChange(
																				absoluteRow,
																				key,
																				e
																					.target
																					.value
																			)
																		}
																		onBlur={() =>
																			setEditingPartCell(
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
															) : numericFields.includes(
																	key
															  ) ? (
																part[key] ?? 0 // show 0 for empty numeric cells
															) : (
																part[key] ?? '0'
															) // keep '-' for non-numeric cells
														}
													</td>
												);
											})}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
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
									className='px-5 py-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition'
								>
									Cancel
								</button>
								<button
									onClick={handleDelete}
									className='px-5 py-2 rounded bg-red-600 text-white hover:bg-red-500 transition'
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Image Upload Modal */}
				{isImageModalOpen && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
						<div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-11/12 sm:w-96 p-6'>
							<h3 className='text-xl font-semibold mb-4'>
								Upload New Image
							</h3>
							<input
								type='file'
								accept='image/*'
								onChange={(e) =>
									setSelectedImage(e.target.files[0])
								}
							/>
							<div className='flex justify-end gap-3 mt-4'>
								<button
									onClick={() => setIsImageModalOpen(false)}
									className='px-5 py-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition'
								>
									Cancel
								</button>
								<button
									onClick={handleLegoSetImageUpload}
									className='px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition'
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
