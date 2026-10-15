import { DataTypes, Model } from 'sequelize';
import { APPLICATION_STATUSES, DBS_STATUS, DELIVERY } from '../config/tutoring.js';

export class TutorApplication extends Model {}

export function initTutorApplication(sequelize) {
  TutorApplication.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      user_id: { type: DataTypes.UUID, allowNull: true },
      full_name: { type: DataTypes.STRING(100), allowNull: false },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        set(value) {
          this.setDataValue('email', typeof value === 'string' ? value.trim().toLowerCase() : value);
        },
      },
      phone: { type: DataTypes.STRING(30), allowNull: false },
      subjects: { type: DataTypes.ARRAY(DataTypes.STRING(40)), allowNull: false },
      learner_groups: { type: DataTypes.ARRAY(DataTypes.STRING(40)), allowNull: false },
      availability: { type: DataTypes.ARRAY(DataTypes.STRING(40)), allowNull: false },
      delivery: { type: DataTypes.ENUM(...Object.keys(DELIVERY)), allowNull: false },
      experience: { type: DataTypes.TEXT, allowNull: false },
      dbs_status: { type: DataTypes.ENUM(...Object.keys(DBS_STATUS)), allowNull: false },
      agreed_to_checks_at: { type: DataTypes.DATE, allowNull: false },
      consent_given_at: { type: DataTypes.DATE, allowNull: false },
      status: { type: DataTypes.ENUM(...APPLICATION_STATUSES), allowNull: false, defaultValue: 'new' },
      admin_notes: { type: DataTypes.TEXT, allowNull: true },
      reviewed_at: { type: DataTypes.DATE, allowNull: true },
      reviewed_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      sequelize,
      modelName: 'TutorApplication',
      tableName: 'tutor_applications',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );
  return TutorApplication;
}
