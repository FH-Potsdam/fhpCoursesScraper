const RawDataPrepare = require( "./lib/RawDataPrepare.js" );

let rawDataPrepare = new RawDataPrepare(),
	testData = [
		{
			moduleName: "14W2D-DP",
			title: "Gestaltungsgrundlagen Atelier Farbe:",
			tutors: "Jens Tix, Marcus Große, Prof. Klaus Keller",
			description: "Lorem Ipsum dolor sit amet. Workspace: https://incom.org/workspace/6886. Fabian Morón Zirfas. Die Teilnehmerzahl ist auf 20 Teilnehmer_innen begrenzt. Anderer Link: https://www.iri-thesys.org/research/research-groups/Innovative-sustainable-land-management/ginkoo/ginkoo-project",
			time: "Freitag 10.00 – 16.00 Uhr, und Donnerstag 10.00, Beginn: 24.10.2016",
			location: "LW 122 Foto S/W-Labor"
		}, {
			moduleName: "99XXXXXXXX-XXX",
			title: "XXXXXXXX: XXXXXXX",
			tutors: "Prof. Dr. Patrick, Lorenz Zeronl, Lorem Ipsum",
			description: "Lorem Ipsum dolor sit amet...",
			time: "Sonntag 00.00 – 23.59 Uhr",
			location: "LW 122 Foto S/W-Labor"
		}, {
			moduleName: "",
			title: "",
			tutors: "",
			description: "",
			time: "",
			location: ""
		}
	];

console.log( JSON.stringify( rawDataPrepare.processDataArray( testData ), null, 4 ) );
