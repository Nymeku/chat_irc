function get_date() {
	var now = new Date();
	var hour = now.getHours();
	var minute = now.getMinutes();

	if (hour.toString().length == 1)
		hour = '0' + hour;
	if (minute.toString().length == 1)
		minute = '0' + minute;
	return date = hour + ':' + minute;
}

module.exports = { get_date };