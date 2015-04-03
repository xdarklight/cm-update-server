var Troll = require('troll-opt').Troll;
var models = require('./models/');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Outputs the newest source-code as ISO-8601 string for the given device / subdirectory.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
});

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
