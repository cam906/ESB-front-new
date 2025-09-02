import { Sequelize } from "sequelize";
import { initUserModel, User } from "./User";
import { initPickModel, Pick } from "./Pick";
import { initPickNewsModel, PickNews } from "./PickNews";
import { initPickStatsViewModel, PickStatsView } from "./PickStatsView";
import { initSportModel, Sport } from "./Sport";
import { initUnlockedPickModel, UnlockedPick } from "./UnlockedPick";
import { initUserRoleModel, UserRole } from "./UserRole";
import { initCompetitorModel, Competitor } from "./Competitor";
import { initCreditPurchaseModel, CreditPurchase } from "./CreditPurchase";
import { initMailQueueModel, MailQueue } from "./MailQueue";

export function initAllModels(sequelize: Sequelize) {
  initUserModel(sequelize);
  initPickModel(sequelize);
  initPickNewsModel(sequelize);
  initPickStatsViewModel(sequelize);
  initSportModel(sequelize);
  initUnlockedPickModel(sequelize);
  initUserRoleModel(sequelize);
  initCompetitorModel(sequelize);
  initCreditPurchaseModel(sequelize);
  initMailQueueModel(sequelize);

  // Associations can be defined here if needed later
  return {
    User,
    Pick,
    PickNews,
    PickStatsView,
    Sport,
    UnlockedPick,
    UserRole,
    Competitor,
    CreditPurchase,
    MailQueue,
  };
}


