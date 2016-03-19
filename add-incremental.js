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
	troll.opt('active', 'Marks the incremental as active (available for download) or not.', { type: 'boolean', required: true });
	troll.opt('filesize', 'The size (in bytes) of the incremental update file.', { type: 'integer' });
});

function createNewIncremental(sourceRom, targetRom) {
	var buildTimestamp = utils.toDate(buildInfo.timestamp);

	var filesize = null;
	if (buildInfo.filesize && !isNaN(buildInfo.filesize)) {
		filesize = buildInfo.filesize;
	}

	models.Incremental.build({
		RomVariantId: sourceRom.RomVariantId,
		sourceRomId: sourceRom.id,
		targetRomId: targetRom.id,
		timestamp: buildTimestamp,
		md5sum: buildInfo.md5sum,
		filename: buildInfo.filename,
		isActive: buildInfo.active == true,
		fileSize: filesize,
	}).save().then(function(newRom) {
		console.log('Successfully created new incremental: ' + JSON.stringify(newRom));
	});
}

var findRomWithTargetFilesZipName = function(targetFilesZipName, subdirectory) {
	return models.Rom.find({
		where: {
			targetFilesZipName: targetFilesZipName,
		},
		include: [
			{
				// Device is implicitly part of the targetFilesZipName.
				model: models.RomVariant,
				where: {
					subdirectory: subdirectory,
				}
			}
		]
	});
}

utils.rethrowUnhandledPromiseRejections();

models.sequelize.sync().then(function() {
	findRomWithTargetFilesZipName(buildInfo.from_target_files, buildInfo.subdirectory).then(function(sourceRom) {
		if (sourceRom) {
			findRomWithTargetFilesZipName(buildInfo.to_target_files, buildInfo.subdirectory).then(function(targetRom) {
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
