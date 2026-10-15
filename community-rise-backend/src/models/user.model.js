import { DataTypes, Model } from 'sequelize';

export const SIGNUP_REASONS = ['learner', 'volunteer', 'funder', 'partner', 'other'];
export const ROLES = ['user', 'admin'];

export class User extends Model {
  // Defence in depth: password_hash never leaves the model via JSON.
  toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}

export function initUser(sequelize) {
  User.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      full_name: { type: DataTypes.STRING(100), allowNull: false },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: 'users_email_unique',
        set(value) {
          this.setDataValue('email', typeof value === 'string' ? value.trim().toLowerCase() : value);
        },
      },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      signup_reason: { type: DataTypes.ENUM(...SIGNUP_REASONS), allowNull: false },
      role: { type: DataTypes.ENUM(...ROLES), allowNull: false, defaultValue: 'user' },
      is_email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      email_verified_at: { type: DataTypes.DATE, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      consent_given_at: { type: DataTypes.DATE, allowNull: false },
      last_login_at: { type: DataTypes.DATE, allowNull: true },
      failed_login_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      locked_until: { type: DataTypes.DATE, allowNull: true },
      teaching_updates_opt_in: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      teaching_updates_opt_in_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      defaultScope: { attributes: { exclude: ['password_hash'] } },
      scopes: { withPassword: { attributes: { include: ['password_hash'] } } },
    },
  );
  return User;
}
