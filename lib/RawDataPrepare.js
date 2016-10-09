class RawDataPrepare {
	constructor () {
		// there is option to write real property defs in es6
		this.KEY_MAPPING_CONFIG = {
			moduleName: "module"
		};

		this.REGEX_TYPES = {
			MODULE_NAME: /(\d{1})(\d{1})([^-]+)-(.+)/i,
			TUTORS: /([^,\ ].[^,]+)/gmi,
			TIME: /^(\w+)\ (\d{1,2}.\d{1,2})\W+(\d{1,2}.\d{1,2})(.+und\ (\w+)\ (\d{1,2}.\d{1,2}))?/i,
			DESCRIPTION_INCOM_URL: /(?:https:\/\/|http:\/\/|\/\/)?(?:www.)?incom.org\/(?:[\S]+)/gmi,
			DESCRIPTION_OTHER_URL: /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gmi,
			DESCRIPTION_MAX_ATTENDANCE: /(?:(\d{1,2})\s+(?:Personen|Teilnehmer\w*))|(?:Teilnehmer\w*:\s*(\d{1,2}))/gmi,
			DATE_START: /(\d{1,2}\.\d{1,2}\.\d{1,4})/ig,
			LOCATION: /^(\w{1,3})(\ |\/)(\d{1,3})(.+)?/i,
			LOCATION_ADDITIONAL: /(und\s*)(\w{1,3})(\ |\/)(\d{1,3})/ig
		};
	}

	processDataArray ( data = [] ) {
		let processedData = new Array( data.length );

		for ( let i = 0; i < data.length; i++ ) {
			processedData[ i ] = this.processDataObject( data[ i ] );
		}

		return processedData;
	}

	processDataObject ( dataObject ) {
		let processedData = {},
			newKey = "";

		for ( let key in dataObject ) {
			newKey = this.KEY_MAPPING_CONFIG[ key ] || key;
			processedData[ newKey ] = this.processKeyValuePair( key, dataObject[ key ] );
		}

		return processedData;
	}

	processKeyValuePair ( key = "", value = "" ) {
		// further preparations accepts only
		// string data types
		if ( !typeof value === "string" ) {
			value = String( value );
		}

		switch ( key ) {
			case "moduleName":
				return this.processModuleName( value );
			case "title":
				return this.processTitle( value );
			case "tutors":
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
				shortTitle: value
			};

		if ( matches !== null && matches.length === 5 ) {
			result = {
				first: matches[ 1 ],
				second: matches[ 2 ],
				type: matches[ 3 ],
				shortTitle: matches[ 4 ]
			};
		}

		return result;
	}

	processTitle ( value ) {
		return value;
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
				days: []
			},
			dayOne = null,
			dayTwo = null,
			date = null;

		// get date
		if ( dateMatch !== null && dateMatch.length === 1 ) {
			date = dateMatch[ 0 ];
		}

		// TODO: max days currently are limited to 2
		if ( matches !== null ) {
			dayOne = {
				date: date,
				day: matches[ 1 ],
				start: matches[ 2 ],
				end: matches[ 3 ],
			};

			result.days.push( dayOne );

			if ( matches[ 5 ] ) {
				dayTwo = {
					date: date, // TODO: change this date to the real date, currently the first day date is taken
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

}

module.exports = RawDataPrepare;
