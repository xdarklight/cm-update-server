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

// TODO: Remove this once sequelize 2 is ready.
var validateUniqueActiveRomPerSubdirectory = function(romVariant, parentRomId, successCallback) {
	// Find all existing active roms for this filename in the given subdirectory.
	models.Rom.count({
		where: {
			isActive: true,
			filename: buildInfo.filename,
		},
		include: [
			{
				model: models.RomVariant,
				where: {
					id: romVariant.id,
				}
			}
		]
	}).success(function(totalExisting) {
		if (totalExisting > 0) {
			throw new Error('There are already ' + totalExisting + ' active ROMs for ' + JSON.stringify(romVariant) + ' with filename ' + buildInfo.filename);
		} else {
			successCallback(romVariant, parentRomId);
		}
	});
}

function createNewRomVariantFor(device) {
	var romVariant = models.RomVariant.build({ DeviceId: device.id, subdirectory: buildInfo.subdirectory });

	romVariant.save().success(function() {
		console.log('Successfully created new rom variant ' + JSON.stringify(romVariant));

		validateUniqueActiveRomPerSubdirectory(romVariant, null, createNewRomFor);
	});
}

function createNewRomFor(romVariant, parentRomId) {
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

	if (isNaN(parentRomId)) {
		parentRomId = null;
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
	}).save().success(function(newRom) {
		console.log('Successfully created new rom: ' + JSON.stringify(newRom));
	});
}

var changelog = null;

if (buildInfo.changelogfile) {
	changelog = fs.readFileSync(buildInfo.changelogfile, 'utf-8');
}

models.sequelize.sync().success(function() {
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
	}).success(function(romVariant) {
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
			}).success(function(parentRom) {
				validateUniqueActiveRomPerSubdirectory(romVariant, parentRom.id, createNewRomFor);
			});
		} else {
			models.Device.find({ name: buildInfo.device }).success(function(device) {
				if (device) {
					createNewRomVariantFor(device);
				} else {
					var device = models.Device.build({ name: buildInfo.device });

					device.save().success(function() {
						console.log('Successfully created new device ' + JSON.stringify(device));

						createNewRomVariantFor(device);
					});
				}
			});
		}
	});
});
