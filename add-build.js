var Troll = require('troll-opt').Troll;
var models = require('./models/');
var fs = require('fs');
var utils = require('./utils.js');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Adds a new build to the database.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('timestamp', 'The build\'s timestamp as "unixepoch" timestamp ("ro.build.date.utc").', { type: 'integer', required: true });
	troll.opt('md5sum', 'The build\'s md5sum.', { type: 'string', required: true });
	troll.opt('filename', 'The resulting filename.', { type: 'string', required: true });
	troll.opt('channel', 'The update-channel.', { type: 'string', required: true });
	troll.opt('api_level', 'The SDK API-level of the ROM ("ro.build.version.sdk").', { type: 'integer', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
	troll.opt('active', 'Marks the build as active (available for download) or not.', { type: 'boolean', required: true });
	troll.opt('sourcecode_timestamp', 'The ("unixepoch") timestamp when the source code was updated.', { type: 'integer' });
	troll.opt('filesize', 'The size (in bytes) of the ZIP file.', { type: 'integer' });
	troll.opt('incrementalid', 'The build\s incremental ID ("ro.build.version.incremental").', { type: 'string' });
	troll.opt('changelogfile', 'A path to a file which contains the changelog (utf-8 encoded) for the build.', { type: 'string' });
	troll.opt('targetfileszip', 'The name of the "target files" ZIP archive (useful for generating incremental updates).', { type: 'string' });
});

function createNewRomVariantFor(device) {
	var variantName = device.name + '_' + new Date().getTime();
	var romVariant = models.RomVariant.build({
		DeviceId: device.id,
		name: variantName,
		subdirectory: buildInfo.subdirectory,
	});

	romVariant.save().then(function() {
		console.log('Successfully created new rom variant ' + JSON.stringify(romVariant));

		createNewRomFor(romVariant, null);
	});
}

function createNewRomFor(romVariant, parentRom) {
	var buildTimestamp = utils.toDate(buildInfo.timestamp);

	var parsedUpdateChannel = new String(buildInfo.channel);
	if (parsedUpdateChannel.toUpperCase() == "RC") {
		parsedUpdateChannel = "RC";
	} else {
		parsedUpdateChannel = parsedUpdateChannel.toLowerCase();
	}

	var sourceCodeTimestamp = null;
	if (buildInfo.sourcecode_timestamp && buildInfo.sourcecode_timestamp > 0) {
		sourceCodeTimestamp = utils.toDate(buildInfo.sourcecode_timestamp);
	}

	var filesize = null;
	if (buildInfo.filesize && !isNaN(buildInfo.filesize)) {
		filesize = buildInfo.filesize;
	}

	var parentRomId = null;
	if (parentRom) {
		parentRomId = parentRom.id;
	}

	models.Rom.build({
		RomVariantId: romVariant.id,
		timestamp: buildTimestamp,
		md5sum: buildInfo.md5sum,
		filename: buildInfo.filename,
		updateChannel: parsedUpdateChannel,
		changelog: changelog,
		apiLevel: buildInfo.api_level,
		isActive: buildInfo.active,
		sourceCodeTimestamp: sourceCodeTimestamp,
		incrementalId: buildInfo.incrementalid,
		parentRomId: parentRomId,
		targetFilesZipName: buildInfo.targetfileszip,
		fileSize: filesize,
	}).save().then(function(newRom) {
		console.log('Successfully created new rom: ' + JSON.stringify(newRom));
	});
}

var changelog = null;

if (buildInfo.changelogfile) {
	changelog = fs.readFileSync(buildInfo.changelogfile, 'utf-8');
}

utils.rethrowUnhandledPromiseRejections();

models.sequelize.sync().then(function() {
	models.RomVariant.find({
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
	}).then(function(romVariant) {
		if (romVariant) {
			models.Rom.find({
				include: [
					{
						model: models.RomVariant,
						where: {
							id: romVariant.id,
						}
					}
				],
				order: 'timestamp DESC'
			}).then(function(parentRom) {
				createNewRomFor(romVariant, parentRom);
			});
		} else {
			models.Device.find({
				where: {
					name: buildInfo.device
				}
			}).then(function(device) {
				if (device) {
					createNewRomVariantFor(device);
				} else {
					var device = models.Device.build({ name: buildInfo.device });

					device.save().then(function() {
						console.log('Successfully created new device ' + JSON.stringify(device));

						createNewRomVariantFor(device);
					});
				}
			});
		}
	});
});
