var models = require('./models/');
var utils = require('./utils.js');

var buildInfo = require('yargs')
	.usage('Usage: $0 [options]\n  Marks a build as disabled so it cannot be downloaded anymore.')
	.alias('device', 'd').nargs('device', 1).describe('device', 'The device ID.')
	.alias('disable_incrementals', 'D').boolean('disable_incrementals').describe('disable_incrementals', 'Disables the incrementals for this rom also.')
	.alias('filename', 'f').nargs('filename', 1).describe('filename', 'The resulting filename.')
	.alias('subdirectory', 's').nargs('subdirectory', 1).describe('subdirectory', 'The subdirectory from which the file can be downloaded.')
	.demandOption(['device', 'filename'])
	.help('help').alias('help', 'h')
	.argv;

utils.rethrowUnhandledPromiseRejections();

models.sequelize.sync().then(function() {
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
			filename: buildInfo.filename,
			isActive: true,
		}
	}).then(function(roms) {
		roms.forEach(function (rom) {
			rom.isActive = false;
			rom.save().then(function() {
				console.log('Disabled ROM: ' + JSON.stringify(rom));
			});

			if (buildInfo.disable_incrementals) {
				models.Incremental.update({
					isActive: false,
				}, {
					where: {
						targetRomId: rom.id,
					},
					// We cannot validate here because our
					// validator enforces that a sourceRomId
					// etc. is set. This is the case, but the
					// update-information does not have it.
					validate: false,
				});
			}
		});
	});
});
