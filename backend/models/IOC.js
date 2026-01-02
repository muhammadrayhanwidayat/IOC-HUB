const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IOC = sequelize.define('IOC', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('url','ip','domain','unknown'),
      allowNull: false,
      defaultValue: 'unknown',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    threat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    urlhaus_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    urlhaus_reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_added: {
      type: DataTypes.STRING, // API returns human-readable timestamps; keep string for now
      allowNull: true,
    },
    reporter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    blacklists: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    payloads: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    // created_at & updated_at handled by sequelize config (underscored: true)
  }, {
    tableName: 'iocs',
    underscored: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['urlhaus_id'] },
      { fields: ['value'] },
    ],
  });

  return IOC;
};