var Troll = require('troll-opt').Troll;
var database = require('./database.js').getInstance();

var UpdateLister = require('./update-lister.js');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Adds a new build to the database.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('timestamp', 'The build\'s timestamp.', { type: 'string', required: true });
	troll.opt('md5sum', 'The build\'s md5sum.', { type: 'string', required: true });
	troll.opt('filename', 'The resulting filename.', { type: 'string', required: true });
	troll.opt('channel', 'The build channel.', { type: 'string', required: true });
	troll.opt('api_level', 'The SDK API-level of the ROM.', { type: 'integer', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string', required: false });
	troll.opt('active', 'Marks the build as active (available for download) or not.', { type: 'boolean', required: true });
});

UpdateLister.addUpdate(buildInfo, database);
