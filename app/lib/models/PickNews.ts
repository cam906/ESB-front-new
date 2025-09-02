import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class PickNews extends Model<InferAttributes<PickNews>, InferCreationAttributes<PickNews>> {
  declare id: CreationOptional<number>;
  declare PickId: number;
  declare news: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

export function initPickNewsModel(sequelize: Sequelize) {
  PickNews.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      PickId: { type: DataTypes.INTEGER, allowNull: false },
      news: { type: DataTypes.STRING(4096), allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "PickNews",
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );
  return PickNews;
}


