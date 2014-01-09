module.exports.toDate = function(unixTimestampObject) {
	return new Date(parseInt(unixTimestampObject) * 1000);
}
