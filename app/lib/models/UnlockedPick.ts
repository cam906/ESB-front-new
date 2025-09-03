import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class UnlockedPick extends Model<InferAttributes<UnlockedPick>, InferCreationAttributes<UnlockedPick>> {
  declare id: CreationOptional<number>;
  declare UserId: number;
  declare PickId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: Date | null;
}

export function initUnlockedPickModel(sequelize: Sequelize) {
  UnlockedPick.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      UserId: { type: DataTypes.INTEGER, allowNull: false },
      PickId: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "UnlockedPick",
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );
  return UnlockedPick;
}


