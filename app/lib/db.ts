import { Sequelize } from "sequelize";

declare global {
  // eslint-disable-next-line no-var
  var __sequelize__: Sequelize | undefined;
}

export function getSequelize(): Sequelize {
  if (!global.__sequelize__) {
    const dbName = process.env.DB_NAME || "esb";
    const dbUser = process.env.DB_USER || "root";
    const dbPass = process.env.DB_PASSWORD || "";
    const dbHost = process.env.DB_HOST || "127.0.0.1";
    const dbPort = Number(process.env.DB_PORT || 3306);

    global.__sequelize__ = new Sequelize(dbName, dbUser, dbPass, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      logging: false,
    });
  }
  return global.__sequelize__;
}


