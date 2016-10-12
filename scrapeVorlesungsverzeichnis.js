var Nightmare = require('nightmare');
var fs = require('fs');

var date = new Date();
var dateString = date.toISOString();

// change studyStage
// 1: 1. Studienabschnitt BA Design (Grundstudium)
// 2: 2. Studienabschnitt BA Design (Hauptstudium)
// 3: MA Design
var studyStage = 3

// generate URL
studyStageURL = (studyStage > 3) ? studyStage + '-studienabschnitt-ba-design/' : 'ma-design/';

var scraper = function (studyStage) {

  //amount of courses
  var courseCount = $(".short").length;

  // data storage
  var data = [];

  // parse every course
  $(".short").each(function(){

    var course = new Object();

    // general courses data

    course.studyStage = studyStage;
    course.summerSemester = $("h1").text().indexOf("SoSe") >= 0;

    // grab text from corresponding css class
    // short class (course table header)
    course.studyCode =   $(this).find(".data_spalte1").first().text()
    course.title =       $(this).find(".data_spalte2").first().text()
    course.profs =       $(this).find(".data_spalte3").first().text()
    course.time =        $(this).find(".data_spalte4").first().text()
    course.location  =   $(this).find(".data_spalte5").first().text()

    // details class (course table body)
    course.description = $(this).next("tr.details").find(".bodytext").first().text()
    course.credits =     $(this).next("tr.details").find(".data_spalte1").first().text()

    // roughly cleanup data
    course.studyCode =  $.trim(course.studyCode.replace(/[\t\n]+/g,' '))
    course.title =      $.trim(course.title.replace(/[\t\n]+/g,' '))
    course.profs =      $.trim(course.profs.replace(/[\t\n]+/g,' '))
    course.time =       $.trim(course.time.replace(/[\t\n]+/g,' '))
    course.location =   $.trim(course.location.replace(/[\t\n]+/g,' '))

    course.credits =    course.credits.match(/([1-9])(?=\WCredits)/g);
    course.credits =    (course.credits && course.credits.length) ? parseInt(course.credits[0]) : undefined ;


    //prepare JSON
    data.push(course);
  });

  return {
    data
  };
}

var vv = new Nightmare()
  .useragent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36")
  .goto('http://www.fh-potsdam.de/studieren/design/studium/vorlesungsverzeichnis/'+studyStageURL)
  .wait(100)
  .evaluate(scraper, studyStage)
  .run(function (err, nightmare) {
        if (err) return console.log(err);

        results = JSON.stringify(nightmare, null, 2)

        console.log(results);
        console.log("SCRAPER DONE");

        //write results to timestamped json file
        fs.writeFile('results/' + dateString + '_VV_StudyStage' + studyStage + '.json', results, 'utf8');
  })
  .end();
