export function isJSONValid(jsonString: string) {
	try {
		JSON.parse(jsonString);
		return true;
	} catch (error) {
		return false;
	}
}
