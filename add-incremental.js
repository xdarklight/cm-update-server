var models = require('./models/');
var fs = require('fs');
var utils = require('./utils.js');

var buildInfo = require('yargs')
	.usage('Usage: $0 [options]\n  Adds a new incremental build to the database.')
	.alias('active', 'a').boolean('active').describe('active', 'Marks the incremental as active (available for download) or not.')
	.alias('filename', 'f').nargs('filename', 1).describe('filename', 'The resulting filename.')
	.alias('filesize', 'i').nargs('filesize', 1).number('filesize').describe('filesize', 'The size (in bytes) of the incremental update file.')
	.alias('from_target_files', 'F').nargs('from_target_files', 1).describe('from_target_files', 'The name of the "target files ZIP" of the incremental\'s "source".')
	.alias('md5sum', 'm').nargs('md5sum', 1).describe('md5sum', 'The build\'s md5sum.')
	.alias('subdirectory', 's').nargs('subdirectory', 1).describe('subdirectory', 'The subdirectory from which the file can be downloaded.')
	.alias('timestamp', 't').nargs('timestamp', 1).number('timestamp').describe('timestamp', 'The build\'s timestamp as "unixepoch" timestamp ("ro.build.date.utc").')
	.alias('to_target_files', 'T').nargs('to_target_files', 1).describe('to_target_files', 'The name of the "target files ZIP" of the incremental\'s "target".')
	.demandOption(['active', 'device', 'filename', 'from_target_files', 'md5sum', 'timestamp', 'to_target_files'])
	.help('help').alias('help', 'h')
	.argv;

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
