var Nightmare = require('nightmare');

class scrapeTermDir {

  scrape (studyStage, callback){


    // generate URL
    var studyStageURL = (studyStage < 3) ? studyStage + '-studienabschnitt-ba-design/' : 'ma-design/';

    var evaluater = function(studyStage){
      // data storage
      var data = [];

      // parse every course
      $(".short").each(function(){

        var course = new Object();

        // general courses data
        course.study = 'design';
        course.studyStage = studyStage;
        course.summerSemester = $("h1").text().indexOf("SoSe") >= 0;
        course.beginYear = $("h1").text();

        // grab text from corresponding css class
        // short class (course table header)
        course.studyCode =   $(this).find(".data_spalte1").first().text()
        course.title =       $(this).find(".data_spalte2").first().text()
        course.teachers =    $(this).find(".data_spalte3").first().text()
        course.time =        $(this).find(".data_spalte4").first().text()
        course.location  =   $(this).find(".data_spalte5").first().text()

        // details class (course table body)
        course.description = $(this).next("tr.details").find(".bodytext").first().text()
        course.credits =     $(this).next("tr.details").find(".data_spalte1").first().text()

        // roughly cleanup data
        course.studyCode =  $.trim(course.studyCode.replace(/[\t\n]+/g,' '))
        course.title =      $.trim(course.title.replace(/[\t\n]+/g,' '))
        course.teachers =   $.trim(course.teachers.replace(/[\t\n]+/g,' '))
        course.location =   $.trim(course.location.replace(/[\t\n]+/g,' '))

        course.credits =    course.credits.match(/([1-9])(?=\WCredits)/g);
        course.credits =    (course.credits && course.credits.length) ? parseInt(course.credits[0]) : undefined ;

        course.beginYear = parseInt(course.beginYear.match(/\d{4}/g)[0]);

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
      .wait("body")
      .evaluate(evaluater, studyStage)
      .run(function (err, nightmare) {
            if (err) return callback(err);
            callback(nightmare.data);
      })
      .end();
  }
}

module.exports = scrapeTermDir;
