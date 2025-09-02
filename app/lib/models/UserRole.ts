import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class UserRole extends Model<InferAttributes<UserRole>, InferCreationAttributes<UserRole>> {
  declare id: CreationOptional<number>;
  declare role: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

export function initUserRoleModel(sequelize: Sequelize) {
  UserRole.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      role: { type: DataTypes.STRING(16), allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "UserRole",
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );
  return UserRole;
}


