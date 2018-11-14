const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql"
  }
);
const DataTypes = require("sequelize/lib/data-types");

const Collectible = sequelize.define(
  "collectibles",
  {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    actived: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "0"
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    tableName: "collectibles",
    timestamps: false
  }
);

const Tip = sequelize.define(
  "tips",
  {
    text: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    tableName: "tips"
  }
);

module.exports = {
  sequelize: sequelize,
  Collectible: Collectible,
  Tip: Tip
};
