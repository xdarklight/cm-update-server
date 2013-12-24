var Troll = require('troll-opt').Troll;
var database = require('./database.js').getInstance();

var UpdateLister = require('./update-lister.js');

var buildInfo = (new Troll()).options(function(troll) {
	troll.banner('Marks a build as disabled so it cannot be downloaded anymore.');
	troll.opt('device', 'The device ID.', { type: 'string', required: true });
	troll.opt('filename', 'The resulting filename.', { type: 'string', required: true });
	troll.opt('subdirectory', 'The subdirectory from which the file can be downloaded.', { type: 'string' });
});

UpdateLister.disableUpdate(buildInfo, database);
