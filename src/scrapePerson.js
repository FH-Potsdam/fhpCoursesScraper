/* global $ */
var Nightmare = require('nightmare');
var vo = require('vo');
var fs = require('fs');

var date = new Date();
var dateString = date.toISOString();

vo(run)(function(err) {
	if (err) throw err;
});

function* run() {
	const nightmare = new Nightmare();
	const MAX_PAGE = 6;
	let currentPage = 0;
	let data = [];

	yield nightmare
		.goto('http://www.fh-potsdam.de/studieren/design/personen/')
		.wait('body');

		while (currentPage < MAX_PAGE) {
			data = data.concat(
				yield nightmare.evaluate(function() {

				var people = [];

				$(".person-item").each(function() {
					const $element = $(this);
					const spaceChars = /[\s]+/g;
					const cleanText = (text) => text
						.first()
						.text()
						.replace(spaceChars, ' ')
						.trim();

					people.push({
						person: cleanText($element.find(".person-data .more-link")),
						mailAddresses: cleanText($element.find(".person-data dd a"),
							(t) => t ? t.replace("­ (at) ", "@") : undefined),
						phoneNumbers: cleanText($element.find(".person-data dd"),
							(t) => t && t.indexOf(' @ ') === -1 ? t : undefined)
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
	data = JSON.stringify(data, null, 2);

	fs.writeFile('results/' + dateString + '_Persons.json', data, 'utf8');
	yield nightmare.end();
}
