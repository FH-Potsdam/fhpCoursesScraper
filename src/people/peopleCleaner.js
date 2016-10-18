import { REGEX_TYPES } from './constants';
import { cleanDirtyObjectValue } from '../utils/cleaningUtil';

export const cleanPerson = ({
	phoneNumbers,
	mailAddresses,
	person
}) => cleanDirtyObjectValue({
	mailAddresses: mailAddresses ? mailAddresses.replace(' (at) ', '@') : null,
	phoneNumbers: phoneNumbers ? phoneNumbers.match(REGEX_TYPES.PHONE_NUMBERS) : null,
	fullName: person ? person : null
});
