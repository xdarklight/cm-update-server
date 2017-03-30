var models = require('./models/');
var fs = require('fs');
var utils = require('./utils.js');

var buildInfo = require('yargs')
	.usage('Usage: $0 [options]\n  Adds a new build to the database.')
	.alias('active', 'A').boolean('active').describe('active', 'Marks the build as active (available for download) or not.')
	.alias('api_level', 'a').nargs('api_level', 1).number('api_level').describe('api_level', 'The SDK API-level of the ROM ("ro.build.version.sdk").')
	.alias('changelogfile', 'C').nargs('changelogfile', 1).describe('changelogfile', 'A path to a file which contains the changelog (utf-8 encoded) for the build.')
	.alias('channel', 'c').nargs('channel', 1).describe('channel', 'The update-channel.')
	.alias('device', 'd').nargs('device', 1).describe('device', 'The device ID.')
	.alias('filename', 'f').nargs('filename', 1).describe('filename', 'The resulting filename.')
	.alias('filesize', 'F').nargs('filesize', 1).number('filesize').describe('filesize', 'The size (in bytes) of the ZIP file.')
	.alias('incrementalid', 'i').nargs('incrementalid', 1).describe('incrementalid', 'The build\'s incremental ID ("ro.build.version.incremental").')
	.alias('md5sum', 'm').nargs('md5sum', 1).describe('md5sum', 'The build\'s md5sum.')
	.alias('subdirectory', 's').nargs('subdirectory', 1).describe('subdirectory', 'The subdirectory from which the file can be downloaded.')
	.alias('sourcecode_timestamp', 'S').nargs('sourcecode_timestamp', 1).number('sourcecode_timestamp').describe('sourcecode_timestamp', 'The ("unixepoch") timestamp when the source code was updated.')
	.alias('targetfileszip', 'T').nargs('targetfileszip', 1).describe('targetfileszip', 'The name of the "target files" ZIP archive (useful for generating incremental updates).')
	.alias('timestamp', 't').nargs('timestamp', 1).number('timestamp').describe('timestamp', 'The build\'s timestamp as "unixepoch" timestamp ("ro.build.date.utc").')
	.demandOption(['api_level', 'active', 'channel', 'device', 'filename', 'md5sum', 'timestamp'])
	.help('help').alias('help', 'h')
	.argv;


function createNewRomVariantFor(device) {
	var variantName = device.name + '_' + buildInfo.api_level + '_' + buildInfo.channel.toLowerCase();
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
