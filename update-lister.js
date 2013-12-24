/*
var UpdateListRequest = {
	"params": {
		"channels": [
			"stable",
			"snapshot",
			"RC",
			"nightly"
		],

		"device": "cmtestdevice"
	},

	"method": "get_all_builds"
};
*/

var config = require('./data/config.js');

module.exports.findUpdates = function(requestObject, database, callback) {

	if (requestObject.method != 'get_all_builds') {
		callback("'" + requestObject.method + "' is not valid!", null);
		return;
	}

	var params = requestObject.params;

	if (!params || !params.device || !params.channels || params.channels.length < 1) {
		callback("The params object (" + params + ") is not valid!", null);
		return;
	}

	var channelParameterStatement = '?';

	for (var i = 1; i < params.channels.length; ++i) {
		channelParameterStatement += ', ?';
	}

	// NOTE: channelParameterStatement *always* have to be the last parameters!
	var statement = "SELECT * FROM updates WHERE active = ? AND device LIKE ? AND channel IN (" + channelParameterStatement + ")";
	var parameters = [ true, params.device, ].concat(params.channels);

	database.all(statement, parameters, function(err, rows) {
		if (err) {
			callback("DB ERROR! " + err, null);
		} else {
			callback(null, rows);
		}
	});
}

module.exports.findUpdateAndCountDownload = function(id, database, callback) {
	database.get('SELECT * FROM updates WHERE id = ? AND active = ?', [ id, true ], function(err, row) {
		if (row) {
			// Increment the download counter (all errors here will be ignored).
			database.run('INSERT INTO statistics (update_id) VALUES (?)', [ id ]);
		}

		callback(err, row);
	});
}

module.exports.addUpdate = function(buildInfo, database) {
	console.log('Adding new updated: ' + JSON.stringify(buildInfo));

	database.run('INSERT INTO\
			updates\
				(timestamp, md5sum, filename, channel, api_level, device, active, subdirectory)\
			VALUES \
				(DATETIME(?, "unixepoch"), ?, ?, lower(?), ?, ?, ?, ?);',
		buildInfo.timestamp,
		buildInfo.md5sum,
		buildInfo.filename,
		buildInfo.channel,
		buildInfo.api_level,
		buildInfo.device,
		buildInfo.active,
		buildInfo.subdirectory);
}

module.exports.disableUpdate = function(buildInfo, database) {
	var statement = 'UPDATE updates SET active = ? WHERE device = ? AND filename = ? and subdirectory = ?';

	console.log('Disabling update which matches ' + JSON.stringify(buildInfo));

	database.run(statement, false, buildInfo.device, buildInfo.filename, buildInfo.subdirectory, function(error, row) {
			if (error) {
				throw error;
			}
		});
}
