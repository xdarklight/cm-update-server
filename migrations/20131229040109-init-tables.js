module.exports = {
	up: function(migration, DataTypes, done) {
		migration.createTable('Devices', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			createdAt: {
				type: DataTypes.DATE,
				isNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				isNull: false,
			},
			name: {
				type: DataTypes.STRING(32),
				unique: true,
			},
		});

		migration.createTable('Roms', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			createdAt: {
				type: DataTypes.DATE,
				isNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				isNull: false,
			},
			timestamp: {
				type: DataTypes.DATE,
				isNull: false,
			},
			md5sum: {
				type: DataTypes.STRING(32),
				notEmpty: true,
			},
			filename: {
				type: DataTypes.STRING(255),
				notEmpty: true,
			},
			updateChannel: {
				type: DataTypes.ENUM,
				values: [ 'stable', 'snapshot', 'RC', 'nightly', 'experimental' ],
				isNull: false,
			},
			changelog: {
				type: DataTypes.TEXT,
				notEmpty: false,
			},
			apiLevel: {
				type: DataTypes.INTEGER.UNSIGNED,
				isNull: false,
				min: 1,
			},
			subdirectory: {
				type: DataTypes.STRING(255),
				notEmpty: false,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				isNull: false,
			},
			DeviceId: {
				type: DataTypes.INTEGER,
				references: "Devices",
				referencesKey: "id",
			},
		});

		migration.createTable('Downloads', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			createdAt: {
				type: DataTypes.DATE,
				isNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				isNull: false,
			},
			RomId: {
				type: DataTypes.INTEGER,
				references: "Roms",
				referencesKey: "id",
			},
		});

		done();
	},
	down: function(migration, DataTypes, done) {
		migration.dropTable('Downloads');
		migration.dropTable('Roms');
		migration.dropTable('Devices');
		done();
	}
}
