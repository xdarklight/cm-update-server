var models = require('./models/');
var utils = require('./utils.js');

var buildInfo = require('yargs')
	.usage('Usage: $0 [options]\n  Outputs all target-files zip names (one per line) for all builds that match the given device / subdirectory.')
	.alias('device', 'd').nargs('device', 1).describe('device', 'The device ID.')
	.alias('max_age_days', 'max_age_days').nargs('max_age_days', 1).number('max_age_days').describe('max_age_days', 'The max age (according to a Rom\'s timestamp) of the target files in days.')
	.alias('subdirectory', 's').nargs('subdirectory', 1).describe('subdirectory', 'The subdirectory from which the file can be downloaded.')
	.demandOption(['device'])
	.help('help').alias('help', 'h')
	.argv;


var minDate = new Date(-8640000000000000);

utils.rethrowUnhandledPromiseRejections();

models.sequelize.sync().then(function() {
	var startTimestamp;

	if (!buildInfo.max_age_days || isNaN(buildInfo.max_age_days)) {
		startTimestamp = minDate;
	} else {
		startTimestamp = new Date();
		startTimestamp.setHours(-24 * buildInfo.max_age_days);
	}

	models.Rom.findAll({
		include: [
			{
				model: models.RomVariant,
				include: [
					{
						model: models.Device,
						where: {
							name: buildInfo.device,
						}
					},
				],

				where: {
					subdirectory: buildInfo.subdirectory
				}
			}
		],
		where: {
			timestamp: {
				gt: startTimestamp,
			},
			targetFilesZipName: {
				ne: null,
			},
		},
	}).then(function(roms) {
		roms.forEach(function(rom) {
			if (rom.targetFilesZipName.length > 0) {
				console.log(rom.targetFilesZipName);
			}
		});
	});
});
