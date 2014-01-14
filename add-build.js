var Troll = require('troll-opt').Troll;
var models = require('./models/');
var fs = require('fs');
var utils = require('./utils.js');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Adds a new build to the database.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('timestamp', 'The build\'s timestamp as "unixepoch" timestamp ("ro.build.date.utc").', { type: 'integer', required: true });
	troll.opt('md5sum', 'The build\'s md5sum.', { type: 'string', required: true });
	troll.opt('filename', 'The resulting filename.', { type: 'string', required: true });
	troll.opt('channel', 'The update-channel.', { type: 'string', required: true });
	troll.opt('api_level', 'The SDK API-level of the ROM ("ro.build.version.sdk").', { type: 'integer', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
	troll.opt('active', 'Marks the build as active (available for download) or not.', { type: 'boolean', required: true });
	troll.opt('sourcecode_timestamp', 'The ("unixepoch") timestamp when the source code was updated.', { type: 'integer' });
	troll.opt('incrementalid', 'The build\s incremental ID ("ro.build.version.incremental").', { type: 'string' });
	troll.opt('changelogfile', 'A path to a file which contains the changelog (utf-8 encoded) for the build.', { type: 'string' });
	troll.opt('targetfileszip', 'The name of the "target files" ZIP archive (useful for generating incremental updates).', { type: 'string' });
});

// TODO: Remove this once sequelize 2 is ready.
var validateUniqueActiveRomPerSubdirectory = function(device, parentRomId, successCallback) {
	var filterParameters = {
		DeviceId: device.id,
		filename: buildInfo.filename,
		subdirectory: buildInfo.subdirectory,
		isActive: true,
	};

	// Find all existing active roms for this filename in the given subdirectory.
	models.Rom.count({
		where: filterParameters,
	}).success(function(totalExisting) {
		if (totalExisting > 0) {
			throw new Error('There are already ' + totalExisting + ' existing ROM matching ' + JSON.stringify(filterParameters));
		} else {
			successCallback(device, parentRomId);
		}
	});
}

function createNewRomFor(device, parentRomId) {


	var buildTimestamp = utils.toDate(buildInfo.timestamp);

	var parsedUpdateChannel = new String(buildInfo.channel);
	if (parsedUpdateChannel.toUpperCase() == "RC") {
		parsedUpdateChannel = "RC";
	} else {
		parsedUpdateChannel = parsedUpdateChannel.toLowerCase();
	}

	var sourceCodeTimestamp = null;
	if (buildInfo.sourcecode_timestamp && buildInfo.sourcecode_timestamp > 0) {
		sourceCodeTimestamp = utils.toDate(buildInfo.sourcecode_timestamp);
	}

	if (isNaN(parentRomId)) {
		parentRomId = null;
	}

	models.Rom.build({
		DeviceId: device.id,
		timestamp: buildTimestamp,
		md5sum: buildInfo.md5sum,
		filename: buildInfo.filename,
		updateChannel: parsedUpdateChannel,
		changelog: changelog,
		apiLevel: buildInfo.api_level,
		subdirectory: buildInfo.subdirectory,
		isActive: buildInfo.active,
		sourceCodeTimestamp: sourceCodeTimestamp,
		incrementalId: buildInfo.incrementalid,
		parentRomId: parentRomId,
		targetFilesZipName: buildInfo.targetfileszip,
	}).save().success(function(newRom) {
		console.log('Successfully created new rom: ' + JSON.stringify(newRom));
	});
}

var changelog = null;

if (buildInfo.changelogfile) {
	changelog = fs.readFileSync(buildInfo.changelogfile, 'utf-8');
}

models.sequelize.sync().success(function() {
	models.Device.find({ where: { name: buildInfo.device } }).success(function(device) {
		if (device) {
			models.Rom.max('id', {
				where: {
					DeviceId: device.id,
					subdirectory: buildInfo.subdirectory,
				}
			}).success(function(parentRomId) {
				validateUniqueActiveRomPerSubdirectory(device, parentRomId, createNewRomFor);
			});
		} else {
			device = models.Device.build({ name: buildInfo.device });

			device.save().success(function() {
				console.log('Successfully created new device ' + JSON.stringify(device));

				validateUniqueActiveRomPerSubdirectory(device, null, createNewRomFor);
			});
		}
	});
});
