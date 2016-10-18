import { cleanCourses } from "./coursesCleaner";
import scrapeCourses from "./coursesScraper";
import { STUDY_STAGES } from "./constants";
import { saveCleanedDataInFile, createFilePathForKey } from '../utils/saveUtil';

let cleanData = [];
let scrapedStagesAlready = 0;

function onScrapeEnd(scrapedData) {
	cleanData = [...cleanData, ...cleanCourses(scrapedData)];
	scrapedStagesAlready++;

	if (scrapedStagesAlready === STUDY_STAGES.length) {
		saveCleanedDataInFile(
			createFilePathForKey('courses'),
			cleanData
		);
	}
}

// Scrape every studyStage
STUDY_STAGES.forEach((stage) => scrapeCourses(stage, onScrapeEnd));
