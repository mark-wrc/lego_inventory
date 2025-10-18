import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import {
	useGetPartByIdQuery,
	useUpdatePartMutation,
	useUpdatePartImageMutation,
} from '../redux/partSlice.js';

const PartDetails = () => {
	const { id } = useParams();
	const { darkMode } = useTheme();

	const { data: partData, isLoading, error } = useGetPartByIdQuery(id);
	const [updatePart, { isLoading: partIsLoading }] = useUpdatePartMutation();
	const [updatePartImage, { isLoading: imageIsLoading }] =
		useUpdatePartImageMutation();

	const [formData, setFormData] = useState(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [isEditable, setIsEditable] = useState(false);

	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);

	const ensureDefaults = (data) => ({
		PaB: 0,
		quantity: 0,
		ordered: 0,
		inventory: 0,
		weight: 0,
		US: 0,
		...data,
	});

	useEffect(() => {
		if (partData?.data) {
			setFormData(ensureDefaults(partData.data));
		}
	}, [partData]);

	if (isLoading) return <p className='p-6 text-center'>Loading part...</p>;
	if (error || !partData?.data)
		return <p className='p-6 text-red-500 text-center'>Part not found!</p>;
	if (!formData) return null;

	const numericFields = [
		'quantity',
		'ordered',
		'inventory',
		'PaB',
		'weight',
		'US',
	];

	const handleChange = (e) => {
		if (!isEditable) return;
		const { name, value } = e.target;
		if (numericFields.includes(name) && Number(value) < 0) return;
		setFormData((prev) => ({
			...prev,
			[name]: numericFields.includes(name)
				? Number(value) || 0
				: value || '',
		}));
		setHasChanges(true);
	};

	const handleSave = async () => {
		try {
			await updatePart({ id: formData._id, ...formData }).unwrap();
			alert('Part updated successfully!');
			setHasChanges(false);
			setIsEditable(false);
		} catch (err) {
			console.error(err);
			alert('Failed to update part.');
		}
	};

	const handleDoubleClick = () => setIsEditable(true);

	const handleImageUpload = () => {
		if (!selectedImage) return alert('Please select an image.');

		const reader = new FileReader();
		reader.readAsDataURL(selectedImage);
		reader.onloadend = async () => {
			try {
				await updatePartImage({
					id: formData._id,
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

	return (
		<div
			className={`${
				darkMode
					? 'bg-gray-900 text-gray-100'
					: 'bg-gray-50 text-gray-900'
			} min-h-screen p-6`}
			onDoubleClick={handleDoubleClick}
		>
			{/* Header */}
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-2xl font-bold'>Part Details</h2>
				{!isEditable ? (
					<span className='text-sm text-gray-500 italic'>
						Double-click anywhere to edit
					</span>
				) : (
					<span className='text-sm text-indigo-500 italic'>
						Editing mode active
					</span>
				)}
			</div>

			{/* Layout */}
			<div className='flex flex-col md:flex-row gap-6 mb-6'>
				{/* Image Section */}
				<div className='md:w-1/3 flex justify-center items-center'>
					<div
						className='w-full h-64 md:h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg cursor-pointer relative group'
						onClick={() => setIsImageModalOpen(true)}
					>
						{formData.partImage?.url ? (
							<img
								src={formData.partImage.url}
								alt={formData.name}
								className='w-full h-full object-cover transition group-hover:opacity-80'
							/>
						) : (
							<div className='flex items-center justify-center h-full text-gray-500 dark:text-gray-400'>
								No Image
							</div>
						)}
						<div className='absolute bottom-2 right-2 bg-indigo-500 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition'>
							Change Image
						</div>
					</div>
				</div>

				{/* Name & Description Section */}
				<div className='md:w-2/3 flex flex-col justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'>
					<input
						type='text'
						name='name'
						value={formData.name}
						onChange={handleChange}
						readOnly={!isEditable}
						className={`w-full text-2xl md:text-3xl font-bold border-b-2 p-1 transition ${
							isEditable
								? 'border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900'
								: 'border-gray-50 bg-transparent cursor-default'
						}`}
					/>

					<label className='py-2'>Description:</label>
					<textarea
						name='item_description'
						value={formData.item_description || ''}
						onChange={handleChange}
						readOnly={!isEditable}
						className={`w-full p-3 rounded-lg border transition ${
							isEditable
								? 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'
								: 'border-gray-50 bg-transparent cursor-default'
						}`}
						placeholder='Description'
					/>
				</div>
			</div>

			{/* Inline Two-Column Form */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
				{[
					{ label: 'Item ID', name: 'item_id', readonly: true },
					{ label: 'Part ID', name: 'part_id', readonly: true },
					{ label: 'PaB', name: 'PaB' },
					{ label: 'Color', name: 'color' },
					{ label: 'Weight', name: 'weight' },
					{ label: 'US', name: 'US' },
					{ label: 'Quantity', name: 'quantity', type: 'number' },
					{ label: 'Ordered', name: 'ordered', type: 'number' },
					{ label: 'Inventory', name: 'inventory', type: 'number' },
					{
						label: 'BS/Standard',
						name: 'bsStandard',
						type: 'select',
						options: ['BS', 'Standard'],
					},
				].map((field) => (
					<div
						key={field.name}
						className='flex items-center justify-between border-b border-gray-300 dark:border-gray-700 pb-2'
					>
						<label className='font-medium w-1/3'>
							{field.label}
						</label>
						{field.type === 'select' ? (
							<select
								name={field.name}
								value={formData[field.name] || ''}
								onChange={handleChange}
								disabled={!isEditable || field.readonly}
								className={`w-2/3 p-2 rounded-lg border transition ${
									isEditable && !field.readonly
										? 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'
										: 'border-transparent bg-transparent cursor-default'
								}`}
							>
								{field.options.map((opt) => (
									<option
										key={opt}
										value={opt}
									>
										{opt}
									</option>
								))}
							</select>
						) : (
							<input
								type={field.type || 'text'}
								name={field.name}
								value={
									formData[field.name] !== null &&
									formData[field.name] !== undefined
										? formData[field.name]
										: 0
								}
								onChange={handleChange}
								readOnly={!isEditable || field.readonly}
								className={`w-2/3 p-2 rounded-lg border transition ${
									isEditable && !field.readonly
										? 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'
										: 'border-transparent bg-transparent cursor-default'
								}`}
							/>
						)}
					</div>
				))}
			</div>

			{/* Save Button */}
			{hasChanges && (
				<div className='flex justify-end'>
					<button
						onClick={handleSave}
						disabled={partIsLoading}
						className={`px-6 py-2 rounded-lg text-white font-semibold transition transform hover:scale-105 ${
							partIsLoading
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
						}`}
					>
						{partIsLoading ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			)}

			{/* Image Upload Modal */}
			{isImageModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
					<div
						className={`${
							darkMode ? 'bg-gray-800' : 'bg-white'
						} p-6 rounded-lg shadow-lg w-80`}
					>
						<h3 className='text-lg font-semibold mb-4 text-center'>
							Update Part Image
						</h3>

						{/* Elegant File Input */}
						<div className='flex flex-col items-center mb-4'>
							<label
								htmlFor='file-upload'
								className={`cursor-pointer w-full px-4 py-2 rounded-lg font-semibold text-white border-2 border-indigo-500 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md hover:scale-105 transition-transform duration-200 ${
									darkMode
										? 'bg-gray-700 border-gray-400 hover:from-gray-600 hover:to-gray-800'
										: ''
								}`}
							>
								Choose File
							</label>
							<input
								id='file-upload'
								type='file'
								accept='image/*'
								onChange={(e) =>
									setSelectedImage(e.target.files[0])
								}
								className='hidden'
							/>
							{selectedImage && (
								<p className='text-sm text-gray-500 mt-2'>
									{selectedImage.name}
								</p>
							)}
						</div>

						<div className='flex justify-between'>
							<button
								onClick={() => setIsImageModalOpen(false)}
								className='px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500'
							>
								Cancel
							</button>
							<button
								onClick={handleImageUpload}
								disabled={imageIsLoading}
								className={`px-4 py-2 rounded-lg text-white transition-all duration-300 ${
									imageIsLoading
										? 'bg-gray-400 cursor-not-allowed'
										: 'bg-indigo-600 hover:bg-indigo-700'
								}`}
							>
								{imageIsLoading ? 'Uploading...' : 'Upload'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PartDetails;
