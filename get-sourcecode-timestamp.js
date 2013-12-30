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
			models.Rom.max('sourceCodeTimestamp', {
				where: {
					DeviceId: device.id,
					subdirectory: buildInfo.subdirectory,
				},
			}).success(function(sourceCodeTimestamp) {
				if (!isNaN(sourceCodeTimestamp)) {
					console.log(sourceCodeTimestamp);
				}
			});
		}
	});
});
