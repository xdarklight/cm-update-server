module.exports.toDate = function(unixTimestampObject) {
	return new Date(parseInt(unixTimestampObject) * 1000);
}

module.exports.toUnixTimestamp = function(date) {
	return date.getTime() / 1000;
}
