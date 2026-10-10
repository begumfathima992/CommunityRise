// Sequelize instance and model registry.
// Schema changes go through migrations only — never call sequelize.sync().
import { Sequelize } from 'sequelize';
import databaseConfig from '../config/database.cjs';
import env from '../config/env.js';
import { initUser, User } from './user.model.js';
import { initRefreshToken, RefreshToken } from './refreshToken.model.js';
import { initAuthToken, AuthToken } from './authToken.model.js';

const { database, username, password, ...options } = databaseConfig[env.NODE_ENV];

export const sequelize = new Sequelize(database, username, password, options);

initUser(sequelize);
initRefreshToken(sequelize);
initAuthToken(sequelize);

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
RefreshToken.belongsTo(RefreshToken, { foreignKey: 'replaced_by_token_id', as: 'replacedBy' });

User.hasMany(AuthToken, { foreignKey: 'user_id', as: 'authTokens', onDelete: 'CASCADE' });
AuthToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export { User, RefreshToken, AuthToken };
