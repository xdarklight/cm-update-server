var models = require('./models/');
var utils = require('./utils.js');

var buildInfo = require('yargs')
	.usage('Usage: $0 [options]\n  Outputs the newest source-code as ISO-8601 string for the given device / subdirectory.')
	.alias('device', 'd').nargs('device', 1).describe('device', 'The device ID.')
	.alias('subdirectory', 's').nargs('subdirectory', 1).describe('subdirectory', 'The subdirectory from which the file can be downloaded.')
	.demandOption(['device'])
	.help('help').alias('help', 'h')
	.argv;

utils.rethrowUnhandledPromiseRejections();

models.sequelize.sync().then(function() {
	models.Rom.find({
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
		order: 'timestamp DESC'
	}).then(function(rom) {
		if (rom && rom.sourceCodeTimestamp) {
			console.log(rom.sourceCodeTimestamp.toISOString());
		}
	});
});
