const pool = require("../config/db");
const logger = require("../utils/logger");

const createAccount = async ({ eventId, eventType, userId, userName }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // const processedEvent = await client.query(
    //   `SELECT 1 FROM public.processed_events WHERE  event_id = $1 LIMIT 1`,
    //   [eventId],
    // );

    const eventResult = await client.query(
      `
    INSERT INTO public.processed_events (
      event_id,
      event_type
    )
    VALUES ($1, $2)
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id,event_type
  `,
      [eventId, eventType],
    );

    if (eventResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { processed: false, duplicate: true };
    }

    const accountResult = await client.query(
      `INSERT INTO public.accounts(auth_user_id,user_name) VALUES ($1,$2) RETURNING id,auth_user_id,user_name,account_status,kyc_status,created_at,updated_at`,
      [userId, userName],
    );

    await client.query("COMMIT");

    logger.info(
      {
        eventId: eventResult.event_id,
        eventType: eventResult.event_type,
        accountId: accountResult.id,
        authUserId: accountResult.auth_user_id,
      },
      "Account created from UserRegistered event",
    );

    return {
      processed: true,
      duplicate: false,
      account: accountResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(
      {
        err: error,
        eventId,
        eventType,
        authUserId: userId,
      },
      "Failed to create account",
    );
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { createAccount };
