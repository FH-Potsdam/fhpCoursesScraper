/* global $ */ // There because the scraper evalute fnc uses jquery of the website
import Nightmare from 'nightmare';
import vo from 'vo';
import { saveCleanedDataInFile, createFilePathForKey } from '../utils/saveUtil';
import { PEOPLE_URL, MAX_PAGE, REGEX_TYPES } from './constants';

const cleanPerson = ({
	phoneNumbers,
	mailAddresses,
	...rest
}) => ({
	mailAddresses: mailAddresses.replace(' (at) ', '@'),
	phoneNumbers: phoneNumbers.match(REGEX_TYPES.PHONE_NUMBERS),
	...rest
});

vo(run)((err) => {
	if (err) {
		throw err;
	}
});

function* run() {
	const nightmare = new Nightmare();
	const people = [];
	let currentPage = 0;

	yield nightmare
		.goto(PEOPLE_URL)
		.wait('body');

		while (currentPage < MAX_PAGE) {
			people.push(
				yield nightmare.evaluate(function() {

				var people = [];

				$('.person-item').each(function() {
					const $element = $(this);
					const spaceChars = /[\s]+/g;
					const cleanText = (text) => text
						.first()
						.text()
						.replace(spaceChars, ' ')
						.trim();

					people.push({
						person: cleanText($element.find('.person-data .more-link')),
						mailAddresses: cleanText($element.find('.person-data dd a')),
						phoneNumbers: cleanText($element.find('.person-data dd'))
					});
				});

				return people;
			})
		);

		currentPage++
		if (currentPage < MAX_PAGE) {
			yield nightmare
				.click('.f3-widget-paginator li.next a')
				.wait('body');
		}

	}

	saveCleanedDataInFile(
		createFilePathForKey('people'),
		people.map(cleanPerson)
	);
	yield nightmare.end();
}
