var Nightmare = require('nightmare');
var vo = require('vo');
var fs = require('fs');

var date = new Date();
var dateString = date.toISOString();

vo(run)(function(err, result) {
    if (err) throw err;
});

//currently the script runs only with defined MAX_PAGE
function* run() {
    var nightmare = Nightmare(),
        MAX_PAGE = 6,
        currentPage = 0,
        //nextExists = true, TO DO
        data = [];


    yield nightmare
        .goto('http://www.fh-potsdam.de/studieren/design/personen/')
        .wait('body')

    //nextExsists = yield nightmare.exists('.f3-widget-paginator li.next a');

    //while (nextExists && currentPage < MAX_PAGE) {
    while (currentPage < MAX_PAGE) {

        console.log(currentPage);
        data = data.concat(yield nightmare
            .evaluate(function() {

              var people = [];

              $(".person-item").each(function(){

                var person = new Object();

                person.fullname =       $(this).find(".person-data .more-link").first().text()
                person.mailAddresses =  $(this).find(".person-data dd a").first().text()
                person.phoneNumbers =   $(this).find(".person-data dd").first().text()

                person.fullname =       $.trim(person.fullname.replace(/[\t\n]+/g,' '))
                person.phoneNumbers =   $.trim(person.phoneNumbers.replace(/[\t\n]+/g,' '))

                person.phoneNumbers =   (person.phoneNumbers === person.mailAddresses) ? undefined : person.phoneNumbers;
                person.mailAddresses =  (person.mailAddresses === '') ? undefined : person.mailAddresses.replace("­ (at) ", "@");

                //prepare JSON
                people.push(person);
              });

              return people;
            }));

        currentPage++
        if(currentPage < MAX_PAGE){
            yield nightmare
              .click('.f3-widget-paginator li.next a')
              .wait('body')
        }

    }
    console.dir(data);
    data = JSON.stringify(data, null, 2)

    //write results to timestamped json file
    fs.writeFile('results/' + dateString + '_Persons.json', data, 'utf8');
    yield nightmare.end();
}
