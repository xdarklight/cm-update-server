var config = require('./data/config.js');
var querystring = require("querystring");

var UpdateListResponse = function(id, resultItems, errorMessage) {
	this.id = id;
	this.result = resultItems;
	this.error = errorMessage;
};

var UpdateItem = function(url, timestamp, md5sum, filename, channel, changes, api_level) {
	this.url = url;
	this.timestamp = timestamp;
	this.md5sum = md5sum;
	this.filename = filename;
	this.channel = channel;
	this.changes = changes;
	this.api_level = api_level;
};

module.exports.convert = function(id, errorMessage, updateList) {
	var list = Array();

	if (updateList && updateList.length > 0) {
		updateList.forEach(function(row) {
			var url = config.getDownloadProxyBaseUrl() + '?' + querystring.stringify({ id : row.id, filename : row.filename });
			var timestampAsDate = new Date(row.timestamp);
			var timestampInSeconds = Math.round(timestampAsDate.getTime() / 1000);

			var item = new UpdateItem(url, timestampInSeconds, row.md5sum, row.filename, row.channel, null, row.api_level);
			list.push(item);
		});
	}

	return new UpdateListResponse(id, list, errorMessage);
}

module.exports.getRealDownloadUrl = function(row) {
	var url = config.getRealDownloadBaseUrl();

	if (row.subdirectory && row.subdirectory.length > 0) {
		url += '/' + row.subdirectory;
	}

	url += '/' + row.filename;

	return url;
}
