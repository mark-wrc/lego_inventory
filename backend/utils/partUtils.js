export const parseWeight = (weight) => {
	if (!weight) return 0;
	if (typeof weight === 'number') return weight;

	let w = weight.toString().trim().toLowerCase();

	if (w.endsWith('kg')) {
		const num = parseFloat(w.replace('kg', '').trim());
		return isNaN(num) ? 0 : num * 1000; // convert kg to grams
	}

	if (w.endsWith('g')) {
		const num = parseFloat(w.replace('g', '').trim());
		return isNaN(num) ? 0 : num;
	}

	// fallback: try to parse as number
	const num = parseFloat(w);
	return isNaN(num) ? 0 : num;
};

export const 	parseUSPrice = (price) => {
	if (!price) return 0;
	if (typeof price === 'number') return price;

	let p = price.toString().trim();
	if (p.startsWith('$')) p = p.slice(1);
	const num = parseFloat(p);
	return isNaN(num) ? 0 : num;
};

export const normalizeBsStandard = (value) => {
	if (!value) return 'BS';
	const v = value.trim();
	if (v === 'BS' || v.toLowerCase() === 'bs') return 'BS';
	if (v === 'Standart' || v.toLowerCase() === 'standart') return 'Standart';
	return 'BS';
};
