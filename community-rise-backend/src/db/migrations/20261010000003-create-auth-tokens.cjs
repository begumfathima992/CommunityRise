'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auth_tokens', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('email_verification', 'password_reset'),
        allowNull: false,
      },
      token_hash: { type: Sequelize.STRING(64), allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      used_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('auth_tokens', ['token_hash'], {
      unique: true,
      name: 'auth_tokens_token_hash_unique',
    });
    await queryInterface.addIndex('auth_tokens', ['user_id', 'type'], { name: 'auth_tokens_user_id_type' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('auth_tokens');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_auth_tokens_type";');
  },
};
