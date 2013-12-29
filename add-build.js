var Troll = require('troll-opt').Troll;
var models = require('./models/');

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
});

function createNewRomFor(device) {
	var parsedUpdateChannel = new String(buildInfo.channel);

	if (parsedUpdateChannel.toUpperCase() == "RC") {
		parsedUpdateChannel = "RC";
	} else {
		parsedUpdateChannel = parsedUpdateChannel.toLowerCase();
	}

	models.Rom.build({
		DeviceId: device.id,
		timestamp: new Date(parseInt(buildInfo.timestamp)),
		md5sum: buildInfo.md5sum,
		filename: buildInfo.filename,
		updateChannel: parsedUpdateChannel,
		changelog: null,
		apiLevel: buildInfo.api_level,
		subdirectory: buildInfo.subdirectory,
		isActive: buildInfo.active
	}).save().success(function(newRom) {
		console.log('Successfully created new rom: ' + JSON.stringify(newRom));
	});
}

models.sequelize.sync().success(function() {
	models.Device.find({ where: { name: buildInfo.device } }).success(function(device) {
		if (device) {
			createNewRomFor(device);
		} else {
			device = models.Device.build({ name: buildInfo.device });

			device.save().success(function() {
				console.log('Successfully created new device ' + JSON.stringify(device));

				createNewRomFor(device);
			});
		}
	});
});
