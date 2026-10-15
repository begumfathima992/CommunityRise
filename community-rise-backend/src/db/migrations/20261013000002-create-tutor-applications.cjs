'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tutor_applications', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      // Set when the applicant was logged in; applications don't need an account.
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      full_name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false },
      phone: { type: Sequelize.STRING(30), allowNull: false },
      subjects: { type: Sequelize.ARRAY(Sequelize.STRING(40)), allowNull: false },
      learner_groups: { type: Sequelize.ARRAY(Sequelize.STRING(40)), allowNull: false },
      availability: { type: Sequelize.ARRAY(Sequelize.STRING(40)), allowNull: false },
      delivery: { type: Sequelize.ENUM('online', 'in_person', 'either'), allowNull: false },
      experience: { type: Sequelize.TEXT, allowNull: false },
      dbs_status: {
        type: Sequelize.ENUM('enhanced_update_service', 'enhanced_other', 'none'),
        allowNull: false,
      },
      agreed_to_checks_at: { type: Sequelize.DATE, allowNull: false },
      consent_given_at: { type: Sequelize.DATE, allowNull: false },
      status: {
        type: Sequelize.ENUM('new', 'contacted', 'approved', 'declined'),
        allowNull: false,
        defaultValue: 'new',
      },
      admin_notes: { type: Sequelize.TEXT, allowNull: true },
      reviewed_at: { type: Sequelize.DATE, allowNull: true },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('tutor_applications', ['email'], { name: 'tutor_applications_email' });
    await queryInterface.addIndex('tutor_applications', ['status', 'created_at'], {
      name: 'tutor_applications_status_created_at',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tutor_applications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tutor_applications_delivery";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tutor_applications_dbs_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tutor_applications_status";');
  },
};
