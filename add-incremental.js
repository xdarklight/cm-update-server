var Troll = require('troll-opt').Troll;
var models = require('./models/');
var fs = require('fs');
var utils = require('./utils.js');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Adds a new incremental build to the database.');
	troll.opt('timestamp', 'The build\'s timestamp as "unixepoch" timestamp ("ro.build.date.utc").', { type: 'integer', required: true });
	troll.opt('md5sum', 'The build\'s md5sum.', { type: 'string', required: true });
	troll.opt('filename', 'The resulting filename.', { type: 'string', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
	troll.opt('from_target_files', 'The name of the "target files ZIP" of the incremental\'s "source".', { type: 'string', required: true });
	troll.opt('to_target_files', 'The name of the "target files ZIP" of the incremental\'s "target".', { type: 'string', required: true });
});

function createNewIncremental(sourceRom, targetRom) {
	var buildTimestamp = utils.toDate(buildInfo.timestamp);

	models.Incremental.build({
		sourceRomId: sourceRom.id,
		targetRomId: targetRom.id,
		timestamp: buildTimestamp,
		md5sum: buildInfo.md5sum,
		filename: buildInfo.filename,
		subdirectory: buildInfo.subdirectory,
	}).save().success(function(newRom) {
		console.log('Successfully created new incremental: ' + JSON.stringify(newRom));
	});
}

var findRomWithTargetFilesZipName = function(targetFilesZipName, subdirectory) {
	return models.Rom.find({ where: {
		targetFilesZipName: targetFilesZipName,
		subdirectory: subdirectory }
	});
}

models.sequelize.sync().success(function() {
	findRomWithTargetFilesZipName(buildInfo.from_target_files, buildInfo.subdirectory).success(function(sourceRom) {
		if (sourceRom) {
			findRomWithTargetFilesZipName(buildInfo.to_target_files, buildInfo.subdirectory).success(function(targetRom) {
				if (targetRom) {
					createNewIncremental(sourceRom, targetRom);
				} else {
					console.log('Target rom with targetFilesZipName "%s" not found.', buildInfo.to_target_files);
				}
			});
		} else {
			console.log('Source rom with targetFilesZipName "%s" not found.', buildInfo.from_target_files);
		}
	});
});
