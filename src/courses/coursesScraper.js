/* global $ */ // There because the scraper evalute fnc uses jquery of the website
import Nightmare from 'nightmare';
import { STUDY_STAGES, COURSE_CATALOG_BASE_URL, SCRAPER_USER_AGENT } from './constants';

const getSudyStageUrl = (studyStage) =>
	studyStage < STUDY_STAGES[STUDY_STAGES.length - 1] ?
		`${studyStage}-studienabschnitt-ba-design/` : 'ma-design/';

const scrapePage = function(studyStage) {
	const courses = [];
	$('.short').each(function() {
		const $element = $(this);
		const getElementText = (el, cleaningCallback) => {
			const text = $(el).text().trim().replace(/[\s]+/g, ' ');
			return Boolean(cleaningCallback) ? cleaningCallback(text) : text;
		}
		courses.push({
			study: 'design',
			studyStage: studyStage,
			summerSemester: getElementText($('h1'),
				(t) => t.indexOf('SoSe') !== -1),
			beginYear: getElementText($('h1'),
				(t) => parseInt(t.match(/\d{4}/g)[0], 10)),
			studyCode: getElementText($element.find('.data_spalte1')),
			title: getElementText($element.find('.data_spalte2')),
			teachers: getElementText($element.find('.data_spalte3')),
			time: getElementText($element.find('.data_spalte4')),
			location: getElementText($element.find('.data_spalte5')),
			description: getElementText(
				$element.next('tr.details').find('.bodytext')),
			credits: getElementText(
				$element.next('tr.details').find('.data_spalte1'),
				(t) => {
					const credits = t.match(/([1-9])(?=\WCredits)/g);
					return credits && credits.length ?
						parseInt(credits[0], 10) : undefined
				}
			)
		});
	});

	return courses;
}


export default (studyStage, callback) =>
	new Nightmare()
		.useragent(SCRAPER_USER_AGENT)
		.goto(`${COURSE_CATALOG_BASE_URL}${getSudyStageUrl(studyStage)}`)
		.wait('body')
		.evaluate(scrapePage, studyStage)
		.run((err, nightmare) => {
			if (err) throw err;
			callback(nightmare);
		})
		.end();
