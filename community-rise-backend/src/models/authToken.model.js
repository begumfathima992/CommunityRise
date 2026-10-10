import { DataTypes, Model } from 'sequelize';

export const AUTH_TOKEN_TYPES = Object.freeze({
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
});

export class AuthToken extends Model {}

export function initAuthToken(sequelize) {
  AuthToken.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      user_id: { type: DataTypes.UUID, allowNull: false },
      type: { type: DataTypes.ENUM(...Object.values(AUTH_TOKEN_TYPES)), allowNull: false },
      token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      used_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'AuthToken',
      tableName: 'auth_tokens',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );
  return AuthToken;
}
