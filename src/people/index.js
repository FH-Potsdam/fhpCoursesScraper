/* global $ */ // There because the scraper evalute fnc uses jquery of the website
import Nightmare from 'nightmare';
import vo from 'vo';
import { saveCleanedDataInFile, createFilePathForKey } from '../utils/saveUtil';
import { PEOPLE_URL, MAX_PAGE } from './constants';
import { cleanPerson } from './peopleCleaner';

vo(run)((err) => {
	if (err) {
		throw err;
	}
});

function* run() {
	const nightmare = new Nightmare();
	let people = [];
	let currentPage = 0;

	yield nightmare
		.goto(PEOPLE_URL)
		.wait('body');

		while (currentPage < MAX_PAGE) {
			people = people.concat(
				yield nightmare.evaluate(function() {

				var person = [];

				$('.person-item').each(function() {
					const $element = $(this);
					const spaceChars = /[\s]+/g;
					const cleanText = (text) => text
						.first()
						.text()
						.replace(spaceChars, ' ')
						.trim();

					person.push({
						person: cleanText($element.find('.person-data .more-link')),
						mailAddresses: cleanText($element.find('.person-data dd a')),
						phoneNumbers: cleanText($element.find('.person-data dd'))
					});
				});

				return person;
			})
		);

		currentPage++
		if (currentPage < MAX_PAGE) {
			yield nightmare
				.click('.f3-widget-paginator li.next a')
				.wait('body');
		}

	}

	const cleanedPeople = people.map((person) => cleanPerson(person));
	saveCleanedDataInFile(
		createFilePathForKey('people'),
		cleanedPeople
	);
	yield nightmare.end();
}
