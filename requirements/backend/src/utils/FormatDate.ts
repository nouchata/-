/*
 ** This function format a date to the following format:
 ** dd/mm/yyyy hh:mm:ss with a padding of 0 if the number is smaller than 10
 */
const FormatDate = (date: Date) => {
	date = new Date(date);
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();

	return `${day < 10 ? '0' + day : day}/${
		month < 10 ? '0' + month : month
	}/${year} ${hours < 10 ? '0' + hours : hours}:${
		minutes < 10 ? '0' + minutes : minutes
	}:${seconds < 10 ? '0' + seconds : seconds}`;
};

export default FormatDate;
