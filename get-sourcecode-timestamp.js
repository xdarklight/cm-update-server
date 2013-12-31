var Troll = require('troll-opt').Troll;
var models = require('./models/');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Outputs the newest source-code timestamp for the given device / subdirectory.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
});

models.sequelize.sync().success(function() {
	models.Device.find({ where: { name: buildInfo.device } }).success(function(device) {
		if (device) {
			models.Rom.max('id', {
				where: {
					DeviceId: device.id,
					subdirectory: buildInfo.subdirectory,
				},
				parseFloat: false,
				parseInt: false,
			}).success(function(romId) {
				if (romId) {
					models.Rom.find(romId).success(function(rom) {
						if (rom.sourceCodeTimestamp) {
							console.log(rom.sourceCodeTimestamp.toISOString());
						}
					});
				}
			});
		}
	});
});
