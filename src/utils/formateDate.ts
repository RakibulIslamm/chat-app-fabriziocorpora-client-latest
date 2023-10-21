import moment from "moment";

export const formateDate = (date: number) => {
	const targetDate = moment(date);
	const daysDifference = moment().diff(targetDate, "days");

	let formattedDate;

	if (daysDifference === 0) {
		formattedDate = targetDate.format("h:mm A");
	} else if (daysDifference <= 7) {
		formattedDate = targetDate.format("dddd");
	} else {
		formattedDate = targetDate.format("MMM D");
	}
	return formattedDate;
};
