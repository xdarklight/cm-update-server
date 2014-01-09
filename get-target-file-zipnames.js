var Troll = require('troll-opt').Troll;
var models = require('./models/');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Outputs all target-files zip names (one per line) for all active builds that match the given device / subdirectory.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
});

models.sequelize.sync().success(function() {
	models.Rom.findAll({
		include: [
			{ model: models.Device, where: { name: buildInfo.device } },
		],
		where: {
			subdirectory: buildInfo.subdirectory,
			isActive: true,
		},
	}).success(function(roms) {
		roms.forEach(function(rom) {
			if (rom.targetFilesZipName) {
				console.log(rom.targetFilesZipName);
			}
		});
	});
});
