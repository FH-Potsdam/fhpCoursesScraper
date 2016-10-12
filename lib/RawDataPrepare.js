let Moment = require( "moment-timezone" );

class RawDataPrepare {
	constructor () {
		// there is option to write real property defs in es6
		this.KEY_MAPPING_CONFIG = {
			moduleName: "module"
		};

		this.REGEX_TYPES = {
			MODULE_NAME: /(\d{1})(\d{1})([^-]+)-(.+)/i,
			MODULE_SUBJECT: /^([^:]+)/i,
			MODULE_CREDITS: /(\d)(?:\sCredits)/gi,
			TUTORS: /([^, ].[^,]+)/gmi,
			STUDIUM_NAME: /(?:BA|MA)(?:\s)(.+$)/gi,
			STUDIUM_START_END: /(\d{4})\/(\d{2})/g,
			STUDY_STAGE: /(\d)\.\s?Studienabschnitt/gi,
			TIME: /^(\w+)\ (\d{1,2}.\d{1,2})\W+(\d{1,2}.\d{1,2})(.+und\ (\w+)\ (\d{1,2}.\d{1,2}))?/i,
			DESCRIPTION_INCOM_URL: /(?:https:\/\/|http:\/\/|\/\/)?(?:www.)?incom.org\/(?:[\S]+)/gmi,
			DESCRIPTION_OTHER_URL: /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gmi,
			DESCRIPTION_MAX_ATTENDANCE: /(?:(\d{1,2})\s+(?:Personen|Teilnehmer\w*))|(?:Teilnehmer\w*:\s*(\d{1,2}))/gmi,
			DESCRIPTION_DATE_START: /(?:\d{1,2})(\.|-|\/)\s?(?:(\d{1,2}\1?)|(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s?)(?:\d{2,4})?/gmi,
			DATE_START: /(\d{1,2}\.\d{1,2}\.\d{1,4})/ig,
			LOCATION: /^(\w{1,3})( |\/)(\d{1,3})(.+)?/i,
			LOCATION_ADDITIONAL: /(und\s*)(\w{1,3})( |\/)(\d{1,3})/ig
		};
	}

	processDataArray ( data = {} ) {
		let courseData = data.courses,
			processedCourseData = new Array( courseData.length ),
			studiumMatch = data.documentTitle.match( this.REGEX_TYPES.STUDIUM_NAME ),
			studiumStartEndMatch = this.REGEX_TYPES.STUDIUM_START_END.exec( data.courseListHeadline ),
			processedData = {
				summerSemester: data.courseListHeadline.indexOf( "SoSe" ) !== -1,
				studium: null,
				studiumStart: null,
				studiumEnd: null,
				studyStage: null,
				courses: []
			};

		// process courses
		for ( let i = 0; i < courseData.length; i++ ) {
			processedCourseData[ i ] = this.processDataObject( courseData[ i ] );
		}

		if ( studiumMatch !== null ) {
			processedData.studium = studiumMatch[ 0 ].replace( /BA |MA /, "" );
		}

		if ( studiumStartEndMatch !== null ) {
			processedData.studiumStart = studiumStartEndMatch[ 1 ];
			processedData.studiumEnd = studiumStartEndMatch[ 2 ];

			// the end year string should has a length of 4, like the begin year string
			if ( processedData.studiumEnd && processedData.studiumEnd.length === 2 ) {
				processedData.studiumEnd = "20" + processedData.studiumEnd;
			}
		}

		if ( data.documentTitle.indexOf( "1. Studienabschnitt" ) !== -1 ) {
			processedData.studyStage = 1;
		} else if ( data.documentTitle.indexOf( "2. Studienabschnitt" ) !== -1 ) {
			processedData.studyStage = 2;
		} else if ( data.documentTitle.indexOf( " MA " ) !== -1 ) {
			processedData.studyStage = 3;
		}

		processedData.courses = processedCourseData;

		return this.transformDataForDB( processedData );
	}

	processDataObject ( dataObject ) {
		let processedData = {},
			newKey;

		for ( let key in dataObject ) {
			newKey = this.KEY_MAPPING_CONFIG[ key ] || key;
			processedData[ newKey ] = this.processKeyValuePair( key, dataObject[ key ] );
		}

		processedData = this.additionalPreparation( processedData );

		return processedData;
	}

	processKeyValuePair ( key = "", value = "" ) {
		if ( typeof value !== "string" ) {
			value = String( value );
		}

		switch ( key ) {
			case "studyCode":
				return this.processModuleName( value );
			case "title":
				return this.processTitle( value );
			case "titleDetails":
				return this.processTitleDetails( value );
			case "profs":
				return this.processTutors( value );
			case "description":
				return this.processDescription( value );
			case "time":
				return this.processTime( value );
			case "location":
				return this.processLocation( value );
			default:
				return null;
		}
	}

	processModuleName ( value ) {
		let matches = value.match( this.REGEX_TYPES.MODULE_NAME ),
			result = {
				first: null,
				second: null,
				type: null,
				shortTitle: null,
				fullTitle: value
			};

		if ( matches !== null && matches.length === 5 ) {
			result.first = matches[ 1 ];
			result.second = matches[ 2 ];
			result.type = matches[ 3 ];
			result.shortTitle = matches[ 4 ];

			if ( typeof result.type === "string" ) {
				result.type = result.type.replace( /^FO/, "" );
			}
		}

		return result;
	}

	processTitle ( value ) {
		let subjectMatch = value.match( this.REGEX_TYPES.MODULE_SUBJECT ),
			result = {
				subject: null,
				title: value
			};

		if ( subjectMatch !== null ) {
			result.subject = subjectMatch[ 0 ];
		}

		return result;
	}

	processTitleDetails ( value ) {
		let creditsMatch = this.REGEX_TYPES.MODULE_CREDITS.exec( value ),
			result = {
				detailsFull: value,
				credits: null
			};

		if ( creditsMatch !== null ) {
			result.credits = creditsMatch[ 1 ]
		}

		return result;
	}

	processTutors ( value ) {
		return value.match( this.REGEX_TYPES.TUTORS );
	}

	processDescription ( value ) {
		let workspaceUrlMatches = value.match( this.REGEX_TYPES.DESCRIPTION_INCOM_URL ),
			otherURLMatches = value.match( this.REGEX_TYPES.DESCRIPTION_OTHER_URL ),
			maxAttendanceMatches = this.REGEX_TYPES.DESCRIPTION_MAX_ATTENDANCE.exec( value ),
			returnData = {
				description: value,
				maxAttendance: null,
				workspaceUrl: null,
				otherUrls: null
			};

		if ( maxAttendanceMatches !== null && maxAttendanceMatches.length > 2 && Number.parseInt( maxAttendanceMatches[ 1 ], 10 ) ) {
			returnData.maxAttendance = Number.parseInt( maxAttendanceMatches[ 1 ], 10 );
		}

		if ( workspaceUrlMatches !== null && workspaceUrlMatches.length ) {
			returnData.workspaceUrl = String( workspaceUrlMatches[ 0 ] );

			// delete last character if its a dot
			if ( returnData.workspaceUrl.lastIndexOf( "." ) === returnData.workspaceUrl.length - 1 ) {
				let regexLastChar = /(?:\.|\,|\;|\:)$/;
				returnData.workspaceUrl = returnData.workspaceUrl.replace( regexLastChar, "" );
			}
		}

		if ( otherURLMatches !== null ) {
			returnData.otherUrls = [];

			for ( let i = 0; i < otherURLMatches.length; i++ ) {
				// check if its not a incom link
				if ( otherURLMatches[ i ].indexOf( "incom.org" ) === -1 ) {
					returnData.otherUrls.push( otherURLMatches[ i ] );
				}
			}
		}

		return returnData;
	}

	processTime ( value ) {
		let matches = value.match( this.REGEX_TYPES.TIME ),
			dateMatch = value.match( this.REGEX_TYPES.DATE_START ),
			result = {
				startDate: null,
				days: []
			},
			dayOne = null,
			dayTwo = null,
			date = null;

		// get date
		if ( dateMatch !== null && dateMatch.length === 1 ) {
			date = dateMatch[ 0 ];
		}

		result.startDate = date;

		// max days currently are limited to 2
		if ( matches !== null ) {
			dayOne = {
				day: matches[ 1 ],
				start: matches[ 2 ],
				end: matches[ 3 ],
			};

			result.days.push( dayOne );

			if ( matches[ 5 ] ) {
				dayTwo = {
					day: matches[ 5 ],
					start: matches[ 6 ] || matches[ 2 ],
					end: matches[ 7 ] || matches[ 3 ]
				};

				result.days.push( dayTwo );
			}
		}

		return result;
	}

	processLocation ( value ) {
		let matchGeneral = value.match( this.REGEX_TYPES.LOCATION ),
			matchSecond = value.match( this.REGEX_TYPES.LOCATION_ADDITIONAL ),
			result = [];

		if ( matchGeneral !== null ) {
			result.push( {
				building: matchGeneral[ 1 ],
				room: matchGeneral[ 3 ],
				type: matchGeneral[ 4 ]
			} );
		}

		// TODO: wont work very well currently
		if ( matchSecond !== null ) {
			result.push( {
				building: matchSecond[ 2 ],
				room: matchSecond[ 4 ],
				type: matchSecond[ 5 ]
			} );
		}

		return result.length ? result : value;
	}

	additionalPreparation ( data ) {
		// recheck time
		if ( data.time.startDate === null ) {
			let timeMatch = data.description.description.match( this.REGEX_TYPES.DESCRIPTION_DATE_START );

			if ( timeMatch !== null && timeMatch.length >= 1 ) {
				data.time.startDate = timeMatch[ 0 ];
			}
		}

		if ( data.time.startDate ) {
			if ( Moment( data.time.startDate, "DD.MM.YYYY", "de" ).isValid() ) {
				data.time.startDate = Moment( data.time.startDate, "DD.MM.YYYY", "de" ).unix();
			} else if ( Moment( data.time.startDate, "DD. MMM YYYY", "de" ).isValid() ) {
				data.time.startDate = Moment( data.time.startDate, "DD. MMM YYYY", "de" ).tz( "Europe/Berlin" ).format();
			}
		}

		return data;
	}

	softParseInt ( value ) {
		let parsedVal = Number.parseInt( value, 10 );

		if ( !Number.isNaN( parsedVal ) && value !== null ) {
			return parsedVal;
		}

		return value;
	}

	transformDataForDB ( data ) {
		let dbData = new Array( data.courses.length );

		for ( let i = 0; i < dbData.length; i++ ) {
			dbData[ i ] = {
				studium: data.studium,
				summerSemester: data.summerSemester,
				beginYear: this.softParseInt( data.studiumStart ),
				endYear: this.softParseInt( data.studiumEnd ),
				studyStage: this.softParseInt( data.courses[ i ].studyCode.first ),
				studyCategoryId: this.softParseInt( data.courses[ i ].studyCode.second ),
				studySubject: data.courses[ i ].title.subject,
				studyCode: data.courses[ i ].studyCode.fullTitle,
				courseCapacity: this.softParseInt( data.courses[ i ].description.maxAttendance ),
				title: data.courses[ i ].title.title,
				description: data.courses[ i ].description.description,
				teacher: data.courses[ i ].profs,
				locations: data.courses[ i ].location,
				incomWorkspaceUrl: data.courses[ i ].description.workspaceUrl,
				credits: this.softParseInt( data.courses[ i ].titleDetails.credits )
			};
		}

		return dbData;
	}
}

module.exports = RawDataPrepare;
