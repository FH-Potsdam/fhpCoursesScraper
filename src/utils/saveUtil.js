import { existsSync, mkdirSync, writeFile } from 'fs';

export const createFilePathForKey = (key) =>
	`./results/${new Date().toISOString()}_${key}.json`

export const saveCleanedDataInFile = (path, data) => {
	const pathArray = path.split('/');
	const basePath = pathArray.splice(0, pathArray.length - 1).join('/');

	if (!existsSync(basePath)) {
		mkdirSync(basePath);
	}
	writeFile(path, JSON.stringify(data, null, '\t'), 'utf8', () => {
		console.log('------------ SCRAPING END ------------'); // eslint-disable-line
		console.log('Items scraped:', data.length); // eslint-disable-line
		console.log('File saved in:', path); // eslint-disable-line
	});
};
