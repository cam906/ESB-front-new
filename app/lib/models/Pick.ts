import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class Pick extends Model<InferAttributes<Pick>, InferCreationAttributes<Pick>> {
  declare id: CreationOptional<number>;
  declare SportId: number;
  declare AwayCompetitorId: number;
  declare HomeCompetitorId: number;
  declare status: number;
  declare title: string;
  declare slug: string | null;
  declare matchTime: Date;
  declare analysis: string;
  declare summary: string;
  declare isFeatured: boolean;
  declare cntUnlocked: number;
  declare ExternalDataObj: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

export function initPickModel(sequelize: Sequelize) {
  Pick.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      SportId: { type: DataTypes.INTEGER, allowNull: false },
      AwayCompetitorId: { type: DataTypes.INTEGER, allowNull: false },
      HomeCompetitorId: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(64), allowNull: false },
      slug: { type: DataTypes.STRING(64), allowNull: true },
      matchTime: { type: DataTypes.DATE, allowNull: false },
      analysis: { type: DataTypes.STRING(1024), allowNull: false },
      summary: { type: DataTypes.STRING(128), allowNull: false },
      isFeatured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      cntUnlocked: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ExternalDataObj: { type: DataTypes.STRING(4096), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Pick",
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );
  return Pick;
}


