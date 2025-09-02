import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes } from "sequelize";

export class PickStatsView extends Model<InferAttributes<PickStatsView>, InferCreationAttributes<PickStatsView>> {
  declare prd: string;
  declare status: number;
  declare cnt: number;
}

export function initPickStatsViewModel(sequelize: Sequelize) {
  PickStatsView.init(
    {
      prd: { type: DataTypes.STRING(8), primaryKey: true, allowNull: false },
      status: { type: DataTypes.INTEGER, allowNull: false },
      cnt: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "PickStatsView",
      timestamps: false,
      freezeTableName: true,
    }
  );
  return PickStatsView;
}


