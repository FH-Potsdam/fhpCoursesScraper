const RawDataPrepare = require( "./lib/RawDataPrepare.js" );

let rawDataPrepare = new RawDataPrepare(),
	testData = {
		courseListHeadline: "Vorlesungsverzeichnis Erster Studienabschnitt WiSe 2016/17 - Änderungen noch möglich!",
		documentTitle: "1. Studienabschnitt BA Design",
		courses: [
			{
				studyCode: "13Th-DM",
				title: "Designmanagement: Medienrecht - Seminar",
				titleDetails: "1.142 alte Studienordnung I/2 Fachorientierung Produktdesign 12FOPd-PU Produkt- & Umweltdesign 6 Credits",
				profs: "Prof. Dr. Nico Heise, Prof. Dr. Patrick, Lorenz Zeronl",
				description: "Lorem Ipsum dolor sit amet..., Kursbeginn ist am 20. Oktober 2016. Lorem Ipsum dolor sit amet. Workspace: https://incom.org/workspace/6886. Fabian Morón Zirfas",
				time: "	Dienstag 14.00 – 18.00 Uhr, 14tägig", // , 20.10.2016
				location: "LW 122 Foto S/W-Labor"
			}
		]
		/*{
			moduleName: "14W2D-DP",
			title: "Gestaltungsgrundlagen Atelier Farbe:",
			tutors: "Jens Tix, Marcus Große, Prof. Klaus Keller",
			description: "Lorem Ipsum dolor sit amet. Workspace: https://incom.org/workspace/6886. Fabian Morón Zirfas. Die Teilnehmerzahl ist auf 20 Teilnehmer_innen begrenzt. Anderer Link: https://www.iri-thesys.org/research/research-groups/Innovative-sustainable-land-management/ginkoo/ginkoo-project",
			time: "Freitag 10.00 – 16.00 Uhr, und Donnerstag 10.00, Beginn: 24.10.2016",
			location: "LW 122 Foto S/W-Labor"
		},*/ /*, {
			moduleName: "",
			title: "",
			tutors: "",
			description: "",
			time: "",
			location: ""
		}*/
	};

console.log( JSON.stringify( rawDataPrepare.processDataArray( testData ), null, 4 ) );
