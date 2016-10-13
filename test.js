const
	RawDataPrepare = require( "./lib/RawDataPrepare.js" ),
	FileSystem = require( "fs" );

let jsonOutputDir = "./transformedData.json",
	rawDataPrepare = new RawDataPrepare(),
	jsonData = null,
	testData = [
		{
			"credits": 6,
			"description": "Dieser handwerklich-praktische Kurs behandelt die Wirkung und Bedeutung von Farben unter physiologischen wie auch unter kulturgeschichtlichen Gesichtspunkten: Kontraste, Farbklänge, Farbsymbolik. Neben praktischen Übungen vor Ort zur Sensibilisierung für Farben und Nuancen wird es auch einige Ausflüge an ausgewählte Orte in Berlin geben, bei denen Farbe eine Rolle spielt.",
			"location": "LW 226",
			"profs": "Dipl.-Des. Maria Kleinschmidt",
			"studyCode": "11At-F",
			"studyStage": 1,
			"summerSemester": false,
			"time": "Freitag  10.00 – 16.00 Uhr",
			"title": "Gestaltungsgrundlagen Atelier Farbe:"
		},
		{
			"credits": 6,
			"description": " Die Gestalt der menschlichen Figur, Anatomie, Proportionslehre, Statik. ",
			"location": "D/323",
			"profs": "Frank Gottsmann",
			"studyCode": "11At-Z",
			"studyStage": 1,
			"summerSemester": false,
			"time": "Dienstag  9.00 – 13.00 Uhr",
			"title": "Gestaltungsgrundlagen Atelier Zeichnen: Figur und Raum"
		}
	];


jsonData = JSON.stringify( rawDataPrepare.processDataArray( testData ), null, 4 );
console.log( jsonData );

// FileSystem.writeFile( jsonOutputDir, jsonData, function ( err ) {
// 	if ( err ) {
// 		console.log( err );
// 	} else {
// 		console.log( "JSON saved to " + jsonOutputDir );
// 	}
// } );
