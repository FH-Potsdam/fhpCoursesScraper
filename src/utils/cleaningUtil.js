export const isValueInvalid = (value) =>
	(value === null || Number.isNaN(value) || value === undefined);

export const cleanDirtyObjectValue = (obj) => {
	const reduceValidObject = (accumulator, key) => {
		const value = obj[key];
		return isValueInvalid(value) ? accumulator :
			Object.assign({}, accumulator, { [key]: value });
	};
	return Object.keys(obj).reduce(reduceValidObject, {});
};
