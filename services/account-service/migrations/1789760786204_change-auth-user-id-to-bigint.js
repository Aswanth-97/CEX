/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.dropColumn("accounts", "auth_user_id");

  pgm.addColumn("accounts", {
    auth_user_id: {
      type: "bigint",
      notNull: true,
      unique: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropColumn("accounts", "auth_user_id");

  pgm.addColumn("accounts", {
    auth_user_id: {
      type: "uuid",
      notNull: true,
      unique: true,
    },
  });
};
