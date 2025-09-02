import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

export class MailQueue extends Model<InferAttributes<MailQueue>, InferCreationAttributes<MailQueue>> {
  declare id: CreationOptional<bigint>;
  declare mailStatus: number;
  declare from: string;
  declare to: string;
  declare cc: string | null;
  declare bcc: string | null;
  declare subject: string;
  declare template: string;
  declare templateVars: string;
  declare attachmentPath: string | null;
  declare attachmentFilename: string | null;
  declare attachmentMediaType: string | null;
  declare errorMessage: string | null;
  declare createdAt: Date;
  declare updatedAt: Date | null;
  declare deletedAt: Date | null;
}

export function initMailQueueModel(sequelize: Sequelize) {
  MailQueue.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      mailStatus: { type: DataTypes.INTEGER, allowNull: false },
      from: { type: DataTypes.STRING(255), allowNull: false },
      to: { type: DataTypes.STRING(255), allowNull: false },
      cc: { type: DataTypes.STRING(255), allowNull: true },
      bcc: { type: DataTypes.STRING(255), allowNull: true },
      subject: { type: DataTypes.STRING(255), allowNull: false },
      template: { type: DataTypes.TEXT, allowNull: false },
      templateVars: { type: DataTypes.TEXT, allowNull: false },
      attachmentPath: { type: DataTypes.STRING(255), allowNull: true },
      attachmentFilename: { type: DataTypes.STRING(255), allowNull: true },
      attachmentMediaType: { type: DataTypes.STRING(255), allowNull: true },
      errorMessage: { type: DataTypes.STRING(255), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: true },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "MailQueue",
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    }
  );
  return MailQueue;
}


