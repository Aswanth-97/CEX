const producer = require("../config/kafka");
const logger = require("../utils/logger");

const publishEvent = async (event) => {
  logger.info(
    {
      eventId: event.id,
      eventType: event.event_type,
      aggregateType: event.aggregate_type,
      aggregateId: event.aggregate_id,
      payload: event.payload,
    },
    "Publishing outbox event",
  );

  await producer.send({
    topic: "user-events",
    messages: [
      {
        key: String(event.aggregate_id),
        value: JSON.stringify({
          eventId: event.id,
          eventType: event.event_type,
          aggregateType: event.aggregate_type,
          aggregateId: event.aggregate_id,
          payload: event.payload,
          createdAt: event.created_at,
        }),
      },
    ],
  });

  return true;
};

module.exports = publishEvent;
