var Troll = require('troll-opt').Troll;
var models = require('./models/');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Outputs all target-files zip names (one per line) for all builds that match the given device / subdirectory.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
	troll.opt('max_age_days', 'The max age (according to a Rom\' timestamp) of the target files in days.', { type: 'integer' });
});

var minDate = new Date(-8640000000000000);

models.sequelize.sync().success(function() {
	var startTimestamp;

	if (!buildInfo.max_age_days || isNaN(buildInfo.max_age_days)) {
		startTimestamp = minDate;
	} else {
		startTimestamp = new Date();
		startTimestamp.setHours(-24 * buildInfo.max_age_days);
	}

	models.Rom.findAll({
		include: [
			{ model: models.Device, where: { name: buildInfo.device } },
		],
		where: {
			subdirectory: buildInfo.subdirectory,
			timestamp: {
				gt: startTimestamp,
			},
			targetFilesZipName: {
				ne: null,
			},
		},
	}).success(function(roms) {
		roms.forEach(function(rom) {
			if (rom.targetFilesZipName.length > 0) {
				console.log(rom.targetFilesZipName);
			}
		});
	});
});
