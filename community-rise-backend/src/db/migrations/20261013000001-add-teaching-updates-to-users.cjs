'use strict';

// Opt-in for "hear about the newest teaching resources" emails.
// Separate from account consent: marketing email needs its own
// explicit, unticked-by-default opt-in (PECR), with a timestamp.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'teaching_updates_opt_in', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('users', 'teaching_updates_opt_in_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'teaching_updates_opt_in_at');
    await queryInterface.removeColumn('users', 'teaching_updates_opt_in');
  },
};
