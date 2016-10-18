export const STUDY_STAGES = [ 1, 2, 3 ];
export const COURSE_CATALOG_BASE_URL =
		'http://www.fh-potsdam.de/studieren/design/studium/vorlesungsverzeichnis/';

export const SCRAPER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) ' +
		'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36';

export const REGEX_TYPES = {
	STUDY_CODE: /(\d{1})(\d{1})(FO|FV)+([^-]+)-(.+)/,
	MODULE_SUBJECT: /^([^:]+)/i,
	MODULE_CREDITS: /(\d)(?:\sCredits)/gi,
	STUDIUM_NAME: /(?:BA|MA)(?:\s)(.+$)/gi,
	STUDIUM_START_END: /(\d{4})\/(\d{2})/g,
	STUDY_STAGE: /(\d)\.\s?Studienabschnitt/gi,
	TIME: /^(\w+)\ *(\d{1,2}.\d{1,2})\W+(\d{1,2}.\d{1,2})(.+und\ (\w+)\ (\d{1,2}.\d{1,2}))?/i,
	TEACHERS: /([^, ].[^,]+)/gmi,
	DESCRIPTION_INCOM_URL: /(?:https:\/\/|http:\/\/|\/\/)?(?:www.)?incom.org\/workspace\/(\d+)/gmi,
	DESCRIPTION_OTHER_URL: /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gmi,
	DESCRIPTION_MAX_ATTENDANCE: /(?:(\d{1,2})\s+(?:Personen|Teilnehmer\w*))|(?:Teilnehmer\w*:\s*(\d{1,2}))/gmi,
	DESCRIPTION_DATE_START: /(?:\d{1,2})(\.|-|\/)\s?(?:(\d{1,2}\1?)|(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s?)(?:\d{2,4})?/gmi,
	DATE_START: /(\d{1,2}\.\d{1,2}\.\d{1,4})/ig,
	LOCATION: /^(\w{1,3})( |\/)(\d{1,3})(.+)?/i,
	LOCATION_ADDITIONAL: /(und\s*)(\w{1,3})( |\/)(\d{1,3})/ig
};

export const DATE = {
	UNIX_FORMAT: 'DD.MM.YYYY',
	TIME_ZONED_FORMAT: 'DD. MMM YYYY',
	LANGUAGE: 'de',
	TIME_ZONE: 'Europe/Berlin'
};

export const KEY_MAPPING_CONFIG = {
	moduleName: 'module'
};
