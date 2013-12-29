var Troll = require('troll-opt').Troll;
var models = require('./models/');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Marks a build as disabled so it cannot be downloaded anymore.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('filename', 'The resulting filename.', { type: 'string', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
});

models.sequelize.sync().success(function() {
	models.Device.find({ where: { name: buildInfo.device } }).success(function(device) {
		if (device) {
			models.Rom.findAll({
				where: {
					DeviceId: device.id,
					filename: buildInfo.filename,
					subdirectory: buildInfo.subdirectory,
					isActive: true,
				}
			}).success(function(roms) {
				roms.forEach(function (rom) {
					rom.isActive = false;
					rom.save();

					console.log('Disabled ROM: ' + JSON.stringify(rom));
				});
			});
		} else {
			console.log('Nothing to remove since device does not exist.');
		}
	});
});
