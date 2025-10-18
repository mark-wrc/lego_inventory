export const validatePart = (part) => {
	if (!part) return false;
	const hasItemId = part.item_id !== undefined && part.item_id !== null;
	const hasPartId = part.part_id !== undefined && part.part_id !== null;
	const hasName = part.name && part.name.trim() !== '';

	return hasItemId && hasPartId && hasName;
};
