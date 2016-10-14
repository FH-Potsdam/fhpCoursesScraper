let Moment = require( "moment-timezone" );

class RawDataPrepare {
	constructor () {
		// there is option to write real property defs in es6
		this.KEY_MAPPING_CONFIG = {
			moduleName: "module"
		};

		this.REGEX_TYPES = {
			STUDY_CODE: /(\d{1})(\d{1})([^-]+)-(.+)/i,
			MODULE_SUBJECT: /^([^:]+)/i,
			MODULE_CREDITS: /(\d)(?:\sCredits)/gi,
			STUDIUM_NAME: /(?:BA|MA)(?:\s)(.+$)/gi,
			STUDIUM_START_END: /(\d{4})\/(\d{2})/g,
			STUDY_STAGE: /(\d)\.\s?Studienabschnitt/gi,
			TIME: /^(\w+)\ *(\d{1,2}.\d{1,2})\W+(\d{1,2}.\d{1,2})(.+und\ (\w+)\ (\d{1,2}.\d{1,2}))?/i,
			TEACHERS: /([^, ].[^,]+)/gmi,
			DESCRIPTION_INCOM_URL: /(?:https:\/\/|http:\/\/|\/\/)?(?:www.)?incom.org\/(?:[\S]+)/gmi,
			DESCRIPTION_OTHER_URL: /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gmi,
			DESCRIPTION_MAX_ATTENDANCE: /(?:(\d{1,2})\s+(?:Personen|Teilnehmer\w*))|(?:Teilnehmer\w*:\s*(\d{1,2}))/gmi,
			DESCRIPTION_DATE_START: /(?:\d{1,2})(\.|-|\/)\s?(?:(\d{1,2}\1?)|(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s?)(?:\d{2,4})?/gmi,
			DATE_START: /(\d{1,2}\.\d{1,2}\.\d{1,4})/ig,
			LOCATION: /^(\w{1,3})( |\/)(\d{1,3})(.+)?/i,
			LOCATION_ADDITIONAL: /(und\s*)(\w{1,3})( |\/)(\d{1,3})/ig
		};
	}

	processDataArray ( data = [] ) {
		let	processedCourseData = new Array( data.length );

		// process courses
		for ( let i = 0; i < data.length; i++ ) {
			processedCourseData[ i ] = this.processDataObject( data[ i ] );
		}

		return this.transformDataForDB( processedCourseData );
	}

	processDataObject ( dataObject ) {
		let processedData = {},
			newKey;

		for ( let key in dataObject ) {
			newKey = this.KEY_MAPPING_CONFIG[ key ] || key;
			processedData[ newKey ] = this.processKeyValuePair( key, dataObject[ key ] );
		}

		processedData.summerSemester = dataObject.summerSemester;
		processedData.studyStage = dataObject.studyStage;
		processedData.credits = dataObject.credits;
		processedData = this.additionalPreparation( processedData );

		return processedData;
	}

	processKeyValuePair ( key = "", value = "" ) {
		if ( typeof value !== "string" ) {
			value = String( value );
		}

		switch ( key ) {

			//untouched by RawDataPrepare
			case "credits":
			case "summerSemester":
			case "studyStage":
				return value; // oh-oh! baby don't hurt me! don't hurt me!

			case "studyCode":
				return this.processStudyCode( value );
			case "title":
				return this.processTitle( value );
			case "teachers":
				return this.processTeachers( value );
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

	processStudyCode ( value ) {
		let matches = value.match( this.REGEX_TYPES.STUDY_CODE ),
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

	processTeachers ( value ) {
		return value.match( this.REGEX_TYPES.TEACHERS );
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
		let dbData = new Array( data.length );

		for ( let i = 0; i < dbData.length; i++ ) {
			let item = data[ i ];

			dbData[ i ] = {
				summerSemester: item.summerSemester,
				studyCategoryId: this.softParseInt( item.studyCode.second ),
				studySubject: item.title.subject,
				studyField: item.studyCode.type,
				studyCode: item.studyCode.fullTitle,
				courseCapacity: this.softParseInt( item.description.maxAttendance ),
				title: item.title.title,
				description: item.description.description,
				teacher: item.profs,
				locations: item.location,
				incomWorkspaceUrl: item.description.workspaceUrl,
				credits: item.credits					
			};
		}

		return dbData;
	}
}

module.exports = RawDataPrepare;
