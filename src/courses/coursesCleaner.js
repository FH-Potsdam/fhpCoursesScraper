import Moment from 'moment-timezone';
import { REGEX_TYPES, DATE, KEY_MAPPING_CONFIG } from './constants';
import { cleanDirtyObjectValue } from '../utils/cleaningUtil';

const softParseInt = (value) => {
	const parsedVal = Number.parseInt(value, 10);
	return !Number.isNaN(parsedVal) && value !== null ?
		Number.parseInt(value, 10) : value;
}

const cleanCourses = (courses = []) => courses.map((course) =>
	transformDataForDB(
		coursePostClean(
			Object.keys(course).reduce((accumulator, key) => {
				const finalKey = KEY_MAPPING_CONFIG[key] || key;
				return Object.assign(
					accumulator, processKeyValuePair(finalKey, course[key])
				);
			}, {})
		)
	));


const processKeyValuePair = (key = '', value = '') => {
	value = String(value);

	switch (key) {
		case 'beginDate':
		case 'beginYear':
		case 'courseCapacity':
		case 'credits':
		case 'days':
		case 'endDate':
		case 'incomWorkspaceId':
		case 'locations':
		case 'semesterWeekHours':
		case 'study':
		case 'studyCategoryId':
		case 'studyField':
		case 'studyStage':
		case 'studySubject':
		case 'teachers':
			return { [key]: value };
		case 'summerSemester':
			return { [key]: value === "false" ? false : true };
		case 'studyCode':
			return { [key]: processStudyCode(value) };
		case 'title':
			return { [key]: processTitle(value) };
		case 'description':
			return { [key]: processDescription(value) };
		case 'time':
			return { [key]: processTime(value) };
		default:
			return { [key]: null };
	}
};

const processStudyCode = (value) => {
	const matches = value.match(REGEX_TYPES.STUDY_CODE);
	const isValidMatch = matches !== null && matches.length === 6;

	return {
		first: isValidMatch ? matches[1] : null,
		second: isValidMatch ? matches[2] : null,
		type: isValidMatch ? matches[4].toUpperCase() : undefined,
		shortTitle: null,
		fullTitle: value
	};
};

const processTitle = (title) => {
	const subjectMatch = title.match(REGEX_TYPES.MODULE_SUBJECT);

	return {
		subject: subjectMatch !== null ? subjectMatch[0] : null,
		title
	};
};

const processDescription = (value) => {
	let workspaceUrlMatches = value.match(REGEX_TYPES.DESCRIPTION_INCOM_URL),
		otherURLMatches = value.match(REGEX_TYPES.DESCRIPTION_OTHER_URL),
		maxAttendanceMatches = REGEX_TYPES.DESCRIPTION_MAX_ATTENDANCE.exec(value),
		returnData = {
			description: value,
			maxAttendance: null,
			workspaceUrl: null,
			otherUrls: null
		};

	if (maxAttendanceMatches !== null && maxAttendanceMatches.length > 2 && Number.parseInt(maxAttendanceMatches[1], 10)) {
		returnData.maxAttendance = Number.parseInt(maxAttendanceMatches[1], 10);
	}

	if (workspaceUrlMatches !== null && workspaceUrlMatches.length) {
		returnData.workspaceUrl = String(workspaceUrlMatches[0]);

		if (returnData.workspaceUrl.lastIndexOf('.') === returnData.workspaceUrl.length - 1) {
			let regexLastChar = /(?:\.|\,|\;|\:)$/;
			returnData.workspaceUrl = returnData.workspaceUrl.replace(regexLastChar, '');
		}
	}

	if (otherURLMatches !== null) {
		returnData.otherUrls = [];

		for (let i = 0; i < otherURLMatches.length; i++) {
			if (otherURLMatches[i].indexOf('incom.org') === -1) {
				returnData.otherUrls.push(otherURLMatches[i]);
			}
		}
	}

	return returnData;
};


const processTime = (value) => {
	let matches = value.match(REGEX_TYPES.TIME),
		dateMatch = value.match(REGEX_TYPES.DATE_START),
		result = {
			startDate: null,
			days: []
		},
		dayOne = null,
		dayTwo = null,
		date = null;

	if (dateMatch !== null && dateMatch.length === 1) {
		date = dateMatch[0];
	}

	result.startDate = date;

	// max days currently are limited to 2
	if (matches !== null) {
		dayOne = {
			day: matches[1],
			start: matches[2],
			end: matches[3],
		};

		result.days.push(dayOne);

		if (matches[5]) {
			dayTwo = {
				day: matches[5],
				start: matches[6] || matches[2],
				end: matches[7] || matches[3]
			};

			result.days.push(dayTwo);
		}
	}

	return result;
};


const coursePostClean = (data) => {
	if (data.time.startDate === null) {
		let timeMatch = data.description.description.match(REGEX_TYPES.DESCRIPTION_DATE_START);

		if (timeMatch !== null && timeMatch.length >= 1) {
			data.time.startDate = timeMatch[0];
		}
	}

	if (data.time.startDate) {
		const { UNIX_FORMAT, TIME_ZONED_FORMAT, LANGUAGE, TIME_ZONE } = DATE;
		if (Moment(data.time.startDate, UNIX_FORMAT, LANGUAGE).isValid()) {
			data.time.startDate = Moment(data.time.startDate, UNIX_FORMAT, LANGUAGE).unix();
		}
		else if (Moment(data.time.startDate, TIME_ZONED_FORMAT, LANGUAGE).isValid()) {
			data.time.startDate = Moment(data.time.startDate, TIME_ZONED_FORMAT, LANGUAGE).tz(TIME_ZONE).format();
		}
	}

	return data;
};


const transformDataForDB = ({
	study,
	beginYear,
	summerSemester,
	studyCode,
	title,
	description,
	credits
}) => cleanDirtyObjectValue({
	study,
	summerSemester,
	credits: softParseInt(credits),
	beginYear: softParseInt(beginYear),
	studyCategoryId: softParseInt(studyCode.second),
	studySubject: title.subject,
	studyField: studyCode.type,
	studyCode: studyCode.fullTitle,
	courseCapacity: softParseInt(description.maxAttendance),
	title: title.title,
	description: description.description,
	incomWorkspaceUrl: description.workspaceUrl
});

module.exports = {
	cleanCourses
};
