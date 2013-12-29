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
	var deviceId = device.id;
	var parsedUpdateChannel = new String(buildInfo.channel);

	if (parsedUpdateChannel.toUpperCase() == "RC") {
		parsedUpdateChannel = "RC";
	} else {
		parsedUpdateChannel = parsedUpdateChannel.toLowerCase();
	}

	var newRom = models.Rom.build({
		DeviceId: deviceId,
		timestamp: new Date(parseInt(buildInfo.timestamp)),
		md5sum: buildInfo.md5sum,
		filename: buildInfo.filename,
		updateChannel: parsedUpdateChannel,
		changelog: null,
		apiLevel: buildInfo.api_level,
		subdirectory: buildInfo.subdirectory,
		isActive: buildInfo.active
	});

	newRom.save().complete(function(err) {
		if (err) {
			throw new Error('Could not add rom with parameters: ' + JSON.stringify(buildInfo) + '.\nError: ' + JSON.stringify(err));
		} else {
			console.log('Successfully created new rom: ' + JSON.stringify(newRom));
		}
	});
}

models.sequelize.sync().complete(function(err) {
	if (err) {
		throw err;
	} else {
		models.Device.find({ where: { name: buildInfo.device } }).complete(function(err, device) {
			if (err) {
				throw err;
			}

			if (device) {
				createNewRomFor(device);
			} else {
				device = models.Device.build({ name: buildInfo.device });

				device.save().complete(function(err) {
					if (err) {
						throw err;
					}

					console.log('Successfully created new device ' + JSON.stringify(device));

					createNewRomFor(device);
				});
			}
		});
	}
});
