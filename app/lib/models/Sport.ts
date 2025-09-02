import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class Sport extends Model<InferAttributes<Sport>, InferCreationAttributes<Sport>> {
  declare id: CreationOptional<number>;
  declare shortTitle: string;
  declare title: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

export function initSportModel(sequelize: Sequelize) {
  Sport.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      shortTitle: { type: DataTypes.STRING(6), allowNull: false },
      title: { type: DataTypes.STRING(32), allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Sport",
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );
  return Sport;
}


