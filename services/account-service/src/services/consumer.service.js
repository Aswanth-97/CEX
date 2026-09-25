const consumer = require("../config/kafka");
const { isRetryableError } = require("../utils/error-policy");
const logger = require("../utils/logger");
const { createAccount } = require("./account.service");

const connectConsumer = async () => {
  await consumer.connect();
  logger.info("kafka consumer connected ");

  await consumer.subscribe({ topic: "user-events", fromBeginning: false });

  logger.info("kafka consumer subscribed to user-events");
};

const runConsumer = async () => {
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value?.toString();

      if (!value) {
        logger.warn(
          { topic, partition, offset: message.offset },
          "kafka message have no value",
        );

        return;
      }

      let event;

      try {
        event = JSON.parse(value);
      } catch (error) {
        logger.error(
          {
            err: error,
            topic,
            partition,
            offset: message.offset,
            value,
          },
          "Failed to parse Kafka event",
        );

        return;
      }

      logger.info(
        {
          topic,
          partition,
          offset: message.offset,
          eventId: event.eventId,
          eventType: event.eventType,
        },
        "kafka event recived",
      );

      if (event.eventType === "UserRegistered") {
        try {
          const result = await createAccount({
            eventId: event.eventId,
            eventType: event.eventType,
            userId: event.payload.userId,
            userName: event.payload.userName,
          });

          logger.info({ result }, "account created ");

          return;
        } catch (error) {
          const retryable = isRetryableError(error);

          logger.error(
            {
              err: error,
              eventId: event.eventId,
              eventType: event.eventType,
              retryable,
            },
            "Failed to process UserRegistered event",
          );

          throw error;
        }
      }

      logger.warn(
        {
          eventId: event.eventId,
          eventType: event.eventType,
        },
        "Unsupported Kafka event type",
      );
    },
  });
};

module.exports = { connectConsumer, runConsumer };
