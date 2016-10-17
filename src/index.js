import { cleanCourses } from "./coursesCleaner";
import { scrape } from "./coursesScraper";
import { STUDY_STAGES } from "./constants";
import fs from 'fs';

let cleanData = [];
let scrapedStagesAlready = 0;

function onScrapeEnd(scrapedData) {
	cleanData = [...cleanData, ...cleanCourses(scrapedData)];
	scrapedStagesAlready++;

	if (scrapedStagesAlready === STUDY_STAGES.length) {
		saveCleanedDataInFile(
			`./results/${new Date().toISOString()}_courses.json`,
			cleanData
		);
	}
}

function saveCleanedDataInFile(path, cleanedData) {
	const pathArray = path.split('/');
	const basePath = pathArray.splice(0, pathArray.length - 1).join('/');

	if (!fs.existsSync(basePath)) {
		fs.mkdirSync(basePath);
	}
	fs.writeFile(path, JSON.stringify(cleanedData, null, 2), 'utf8', () => {
		console.log('------------ SCRAPING END ------------'); // eslint-disable-line
		console.log('Courses scraped:', cleanData.length); // eslint-disable-line
		console.log('File saved in:', path); // eslint-disable-line
	});
}

// Scrape every studyStage
STUDY_STAGES.forEach((stage) => scrape(stage, onScrapeEnd));
