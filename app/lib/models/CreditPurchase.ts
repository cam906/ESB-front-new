import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class CreditPurchase extends Model<InferAttributes<CreditPurchase>, InferCreationAttributes<CreditPurchase>> {
  declare id: CreationOptional<number>;
  declare UserId: number;
  declare PackageId: number;
  declare callbackKey: string | null;
  declare priceInCents: number;
  declare credits: number;
  declare ExternalPaymentProcessor: string | null;
  declare ExternalChargeId: string | null;
  declare startedAt: Date;
  declare appliedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

export function initCreditPurchaseModel(sequelize: Sequelize) {
  CreditPurchase.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      UserId: { type: DataTypes.INTEGER, allowNull: false },
      PackageId: { type: DataTypes.INTEGER, allowNull: false },
      callbackKey: { type: DataTypes.STRING(256), allowNull: true },
      priceInCents: { type: DataTypes.INTEGER, allowNull: false },
      credits: { type: DataTypes.INTEGER, allowNull: false },
      ExternalPaymentProcessor: { type: DataTypes.STRING(64), allowNull: true },
      ExternalChargeId: { type: DataTypes.STRING(64), allowNull: true },
      startedAt: { type: DataTypes.DATE, allowNull: false },
      appliedAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "CreditPurchase",
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );
  return CreditPurchase;
}


