var http = require('http');

var database = require('./database.js').getInstance();
var config = require('./data/config.js');

var RequestParser = require('./request-parser.js');
var UpdateLister = require('./update-lister.js');
var ResultConverter = require('./result-converter.js');

function listAvailableUpdates(request, response) {
	var requestParser = new RequestParser(request);

	var parsingSuccessful = function(parsedObject) {
		result = UpdateLister.findUpdates(parsedObject, database, function(errorMessage, updates) {
			var result = ResultConverter.convert(null, errorMessage, updates);

			response.writeHead(200, 'OK', { 'Content-Type' : 'application/json'});
			response.end(JSON.stringify(result));
		});
	};
	var parsingFailed = function(errorCode) {
		response.writeHead(errorCode);
		response.end();
	};

	requestParser.execute(parsingSuccessful, parsingFailed);
}

function countAndRedirect(url, response) {
	if (!url.query || !url.query['id'] || url.query['id'] < 1) {
		response.writeHead(400);
		response.end();
	}

	UpdateLister.findUpdateAndCountDownload(url.query['id'], database, function(error, row) {
		if (error) {
			response.writeHead(500);
		} else if (row) {
			var realDownloadUrl = ResultConverter.getRealDownloadUrl(row);

			response.writeHead(301, { Location: realDownloadUrl });
		} else {
			response.writeHead(404);
		}

		response.end();
	});
}

http.createServer(function (request, response) {

	var url = require('url').parse(request.url, true);

	switch (url.pathname) {
		case '/download-rom':
			countAndRedirect(url, response);
			break;

		case '/list-available-updates':
			listAvailableUpdates(request, response);
			break;

		default:
			response.writeHead(404);
			response.end();
			break;
	}

}).listen(config.getServerPort());

console.log('Server running at port ' + config.getServerPort());
