var Troll = require('troll-opt').Troll;
var models = require('./models/');
var utils = require('./utils.js');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Marks a build as disabled so it cannot be downloaded anymore.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('filename', 'The resulting filename.', { type: 'string', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
	troll.opt('disable_incrementals', 'Disables the incrementals for this rom also.', { type: 'boolean' });
});

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
