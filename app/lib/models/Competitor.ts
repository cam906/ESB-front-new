import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class Competitor extends Model<InferAttributes<Competitor>, InferCreationAttributes<Competitor>> {
  declare id: CreationOptional<number>;
  declare SportId: number;
  declare name: string;
  declare logo: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

export function initCompetitorModel(sequelize: Sequelize) {
  Competitor.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      SportId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(128), allowNull: false },
      logo: { type: DataTypes.STRING(128), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Competitor",
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );
  return Competitor;
}


