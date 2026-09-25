const pool = require("../config/db");
const logger = require("../utils/logger");
const publishEvent = require("./publisher.service");

const getPendingEvents = async (limit = 10) => {
  const query = `SELECT id,event_type,aggregate_type,aggregate_id,payload,status,created_at FROM  public.outbox_events WHERE status='PENDING' ORDER BY created_at ASC LIMIT $1`;
  const result = await pool.query(query, [limit]);

  return result.rows;
};

const processOutbox = async () => {
  try {
    const events = await getPendingEvents(10);

    for (const event of events) {
      const published = await publishEvent(event);

      if (!published) {
        logger.warn(
          {
            eventId: event.id,
          },
          "Outbox event was not published",
        );

        continue;
      }

      const processedEvent = await markEventProcessed(event.id);

      if (!processedEvent) {
        logger.warn(
          {
            eventId: event.id,
          },
          "Outbox event could not be marked as processed",
        );

        continue;
      }

      logger.info(
        {
          eventId: processedEvent.id,
          processedAt: processedEvent.processed_at,
        },
        "Outbox event marked as processed",
      );
    }

    logger.info(
      {
        eventCount: events.length,
      },
      "Pending outbox events fetched",
    );
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      "Failed to process outbox events",
    );
  }
};



const markEventProcessed = async (eventId) => {
  const query = `
    UPDATE public.outbox_events
    SET
      status = 'PROCESSED',
      processed_at = now()
    WHERE id = $1
      AND status = 'PENDING'
    RETURNING
      id,
      status,
      processed_at
  `;

  const result = await pool.query(query, [eventId]);

  return result.rows[0] || null;
};

module.exports = {
  processOutbox,
  getPendingEvents,
  publishEvent,
  markEventProcessed,
};
