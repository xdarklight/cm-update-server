var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/database.sqlite');

db.run("\
	CREATE TABLE IF NOT EXISTS devices (\
		id VARCHAR(20) PRIMARY KEY NOT NULL\
	);\
");

db.run("\
	CREATE TABLE IF NOT EXISTS updates (\
		id INTEGER PRIMARY KEY AUTOINCREMENT,\
		timestamp DATETIME NOT NULL,\
		md5sum CHARACTER(32),\
		filename VARCHAR(255) NOT NULL,\
		channel VARCHAR(10) NOT NULL,\
		changelog TEXT,\
		api_level INTEGER NOT NULL,\
		subdirectory VARCHAR(255) NULL,\
		device VARCHAR(20) NOT NULL,\
		active BOOLEAN DEFAULT FALSE NOT NULL,\
		FOREIGN KEY(device) REFERENCES devices(id)\
	);\
");

db.run("\
	CREATE TABLE IF NOT EXISTS statistics (\
		update_id INTEGER NOT NULL,\
		timestamp DATETIME DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,\
		FOREIGN KEY(update_id) REFERENCES updates(id)\
	);\
");

module.exports.getInstance = function() { return db; }
