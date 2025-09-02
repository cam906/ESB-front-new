import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare name: string;
  declare credits: CreationOptional<number>;
  declare cognitoUserId: string | null;
  declare oldSystemUserId: string | null;
  declare roles: string | null; // comma-separated roles
  declare myReferralCode: string | null;
  declare otherReferralCode: string | null;
  declare password: string; // bcrypt hash
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING(128), allowNull: false },
      name: { type: DataTypes.STRING(128), allowNull: false },
      credits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      cognitoUserId: { type: DataTypes.STRING(64), allowNull: true },
      oldSystemUserId: { type: DataTypes.STRING(64), allowNull: true },
      roles: { type: DataTypes.STRING(64), allowNull: true },
      myReferralCode: { type: DataTypes.STRING(16), allowNull: true },
      otherReferralCode: { type: DataTypes.STRING(16), allowNull: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );
  return User;
}


