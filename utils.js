module.exports.toDate = function(unixTimestampObject) {
	return new Date(parseInt(unixTimestampObject) * 1000);
}

module.exports.toUnixTimestamp = function(date) {
	return new Date(date).getTime() / 1000;
}

module.exports.rethrowUnhandledPromiseRejections = function() {
	// http://bluebirdjs.com/docs/api/error-management-configuration.html#global-rejection-events
	// https://github.com/sequelize/sequelize/issues/5576
	process.on("unhandledRejection", function(exception, promise) {
		throw exception;
	});
}
