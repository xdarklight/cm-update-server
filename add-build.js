var Troll = require('troll-opt').Troll;
var models = require('./models/');
var fs = require('fs');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Adds a new build to the database.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('timestamp', 'The build\'s timestamp as "unixepoch" timestamp.', { type: 'integer', required: true });
	troll.opt('md5sum', 'The build\'s md5sum.', { type: 'string', required: true });
	troll.opt('filename', 'The resulting filename.', { type: 'string', required: true });
	troll.opt('channel', 'The update-channel.', { type: 'string', required: true });
	troll.opt('api_level', 'The SDK API-level of the ROM.', { type: 'integer', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
	troll.opt('active', 'Marks the build as active (available for download) or not.', { type: 'boolean', required: true });
	troll.opt('sourcecode_timestamp', 'The ("unixepoch") timestamp when the source code was updated.', { type: 'integer' });
	troll.opt('changelogfile', 'A path to a file which contains the changelog (utf-8 encoded) for the build.', { type: 'string' });
});

function toDate(unixTimestampObject) {
	return new Date(parseInt(unixTimestampObject) * 1000);
}

function createNewRomFor(device, parentRomId) {
	var buildTimestamp = toDate(buildInfo.timestamp);

	var parsedUpdateChannel = new String(buildInfo.channel);
	if (parsedUpdateChannel.toUpperCase() == "RC") {
		parsedUpdateChannel = "RC";
	} else {
		parsedUpdateChannel = parsedUpdateChannel.toLowerCase();
	}

	var sourceCodeTimestamp = null;
	if (buildInfo.sourcecode_timestamp && buildInfo.sourcecode_timestamp > 0) {
		sourceCodeTimestamp = toDate(buildInfo.sourcecode_timestamp);
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
		parentRomId: parentRomId,
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
				createNewRomFor(device, parentRomId);
			});
		} else {
			device = models.Device.build({ name: buildInfo.device });

			device.save().success(function() {
				console.log('Successfully created new device ' + JSON.stringify(device));

				createNewRomFor(device, null);
			});
		}
	});
});
