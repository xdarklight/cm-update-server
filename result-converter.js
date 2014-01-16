var config = require('config').Application;
var querystring = require('querystring');
var utils = require('./utils.js');

var RomListResponse = function(id, resultItems, errorMessage) {
	this.id = id;
	this.result = resultItems;
	this.error = errorMessage;
};

var RomListItem = function(url, timestamp, md5sum, filename, channel, changes, api_level, incrementalId) {
	this.url = url;
	this.timestamp = timestamp;
	this.md5sum = md5sum;
	this.filename = filename;
	this.channel = channel;
	this.changes = changes;
	this.api_level = api_level;
	this.incremental = incrementalId;
};

var SuccessfulIncrementalReponse = function(timestamp, filename, download_url, md5sum, incremental) {
	this.date_created_unix = timestamp;
	this.filename = filename;
	this.download_url = download_url;
	this.md5sum = md5sum;
	this.incremental = incremental;
}

var FailedIncrementalReponse = function(errors) {
	this.errors = errors;
}

var IncrementalErrorItem = function(message) {
	this.message = message;
}

module.exports.convertIncrementalErrors = function(errorMessages) {
	var errors = [];

	if (Array.isArray(errorMessages)) {
		for (message in errorMessages) {
			errors.push(new IncrementalErrorItem(message));
		}
	} else {
		errors.push(new IncrementalErrorItem(errorMessages));
	}

	return new FailedIncrementalReponse(errors);
}

module.exports.convertIncremental = function(incremental) {
	var targetRom = incremental.targetRom;
	var unixTimestamp = utils.toUnixTimestamp(targetRom.timestamp);
	var downloadUrl;

	if (config.isDownloadProxyEnabled) {
		downloadUrl = config.proxyIncrementalDownloadBaseUrl + '/' + incremental.id + '?' + querystring.stringify({ filename : incremental.filename });
	} else {
		downloadUrl = module.exports.getRealIncrementalDownloadUrl(incremental);
	}

	return new SuccessfulIncrementalReponse(unixTimestamp, incremental.filename, downloadUrl, incremental.md5sum, targetRom.incrementalId);
}

module.exports.getRealIncrementalDownloadUrl = function(incremental) {
	var url = config.realIncrementalDownloadBaseUrl;

	if (incremental.subdirectory && incremental.subdirectory.length > 0) {
		url += '/' + incremental.subdirectory;
	}

	url += '/' + incremental.filename;

	return url;
}

module.exports.convertRomList = function(id, errorMessage, updateList) {
	var list = Array();

	if (updateList && updateList.length > 0) {
		updateList.forEach(function(rom) {
			var changelogUrl = module.exports.getChangelogUrl(rom);

			var downloadUrl;

			if (config.isDownloadProxyEnabled) {
				downloadUrl = config.proxyRomDownloadBaseUrl + '/' + rom.id + '?' + querystring.stringify({ filename : rom.filename });
			} else {
				downloadUrl = module.exports.getRealRomDownloadUrl(rom);
			}

			var timestampInSeconds = Math.round(rom.timestamp.getTime() / 1000);

			var item = new RomListItem(downloadUrl, timestampInSeconds, rom.md5sum, rom.filename, rom.updateChannel, changelogUrl, rom.apiLevel, rom.incrementalId);
			list.push(item);
		});
	}

	return new RomListResponse(id, list, errorMessage);
}

module.exports.getRealRomDownloadUrl = function(rom) {
	var url = config.realRomDownloadBaseUrl;

	if (rom.subdirectory && rom.subdirectory.length > 0) {
		url += '/' + rom.subdirectory;
	}

	url += '/' + rom.filename;

	return url;
}

module.exports.getChangelogUrl = function(rom) {
	return config.changelogBaseUrl + '/' + rom.id;
}

var _getChangelogContent = function(rom) {
	var content = "";

	if (rom && rom.changelog && rom.changelog.length > 0) {
		if (rom.sourceCodeTimestamp && rom.sourceCodeTimestamp > 0) {
			content += "===================================\n";
			content += "Since ";
			content += rom.sourceCodeTimestamp.toUTCString();
			content += "\n===================================\n\n";
		}

		content += rom.changelog + "\n";
	}

	return content;
}

module.exports.getChangelogContent = function(rom, findParentRomHandler, resultCallback) {
	var content = _getChangelogContent(rom);
	var i = 0;

	if (config.additionalPreviousChangelogs > 0) {
		var updateChangelogWithParent = function(parent) {
			if (parent) {
				++i;
				currentRom = parent;

				if (content.length > 0) {
					// Spearator between two roms.
					content += "\n\n";
				}

				content += _getChangelogContent(currentRom);

				if (i < config.additionalPreviousChangelogs) {
					findParentRomHandler(parent, function(anotherParent) {
						updateChangelogWithParent(anotherParent);
					});
				} else {
					// Parent limit reached -> emit the result.
					resultCallback(content);
				}
			} else {
				// There are no more parents -> emit the result.
				resultCallback(content);
			}
		};

		findParentRomHandler(rom, function(parent) {
			updateChangelogWithParent(parent);
		});
	} else {
		// There are no "parents" to fetch -> emit the result.
		resultCallback(content);
	}
}
