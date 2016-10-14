[![Join the chat at https://gitter.im/FH-Potsdam/coursesAPI][gitterBadge]][gitterUrl]

# FHP Design Courses Scraper  
This scrapper is designed to extract informations about the design courses given in the University of Applied Science Potsdam. More precisely, it focuses on scrapping the [online course catalog][vorlesungsverzeichnis FHP] of the design faculty.

## Prerequisites
To contribute to the development and to run the courses API, make sure you fulfill the following prerequisites:

- node 6.7.0
- [nightmare.js](https://github.com/segmentio/nightmare)

## Quick Start

```bash
# clone this repository
git clone https://github.com/FH-Potsdam/fhpCoursesScraper.git

# install node dependencies
npm install

# add a results dir (sry!)
mkdir results

# start the courses scraper
node index.js
```

## What to expect
The script will spit out a timestamped json file in **/results** with all courses from

- http://www.fh-potsdam.de/studieren/design/studium/vorlesungsverzeichnis/1-studienabschnitt-ba-design/
- http://www.fh-potsdam.de/studieren/design/studium/vorlesungsverzeichnis/2-studienabschnitt-ba-design/
- http://www.fh-potsdam.de/studieren/design/studium/vorlesungsverzeichnis/ma-design/


## How we do it

# Related Repositories
- [CoursesAPI](https://github.com/FH-Potsdam/coursesAPI) 
- [Viewer (App)](https://github.com/FH-Potsdam/coursesViewer)


## Collaborators
- [Julia Freyhoff](https://github.com/antsteelmule) — @antsteelmule
- [Lucas Vogel](https://github.com/vogelino) — @vogelino
- [Jonas Köpfer](https://github.com/topada) — @topada
- [Joseph Ribbe](https://github.com/coderwelsch) — @coderwelsch
- [Bela Kurek](https://github.com/q-rec) — @q-rec

<!--- Links -->
[gitterBadge]: https://badges.gitter.im/Join%20Chat.svg
[gitterUrl]:  https://gitter.im/FH-Potsdam/coursesAPI?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

[vorlesungsverzeichnisFHP]: https://www.fh-potsdam.de/studieren/design/studium/vorlesungsverzeichnis
