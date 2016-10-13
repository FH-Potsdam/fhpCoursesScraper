const RawDataPrepare =  require( "./lib/RawDataPrepare.js" );
const ScrapeTermDir =   require( "./lib/ScrapeTermDir.js" );
const fs =              require('fs');


let scraper = new ScrapeTermDir();
let rawDataPrepare = new RawDataPrepare();
let scrapedData = [];
let cleanData = [];
let studyStages = [ 1, 2, 3 ]; // study stages, like in _scrapeVorlesungsverzeichnis.js_
let scrapedDone = 0;

let date = new Date();
let dateString = date.toISOString();

// cleanup scrapedData for every StudyStage and add to cleanData
function scrapeCallback ( scrapedData ) {
    cleanData.push( rawDataPrepare.processDataArray( scrapedData ) );
    scrapedDone++;
    if ( scrapedDone === studyStages.length - 1 ) {
        done();
    }
}

// write cleanData to timestamped json file
function done () {
    console.dir(cleanData);
    jsonData = JSON.stringify(cleanData, null, 2)
    fs.writeFile('results/' + dateString + '_TermDir.json', jsonData, 'utf8');
}

// scrape every studyStage
for ( i = studyStages[0]; i <= studyStages.length; i++ ) {
    scraper.scrape(i, scrapeCallback);
}
