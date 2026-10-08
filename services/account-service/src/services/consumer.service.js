const { consumer, producer } = require("../config/kafka");
const logger = require("../utils/logger");
const { createAccount } = require("./account.service");
const { withRetry } = require("../utils/retry");
const { publishDLQ } = require("./kafkaPublisher");

const connectConsumer = async () => {
  await consumer.connect();
  logger.info("kafka consumer connected ");

  await producer.connect();
  logger.info("kafka producer connected ");

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

        await publishDLQ({
          error,
          attempt: 0,
          rawValue: value,
          topic,
          partition,
          offset: message.offset,
        });

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
          const result = await withRetry(() =>
            createAccount({
              eventId: event.eventId,
              eventType: event.eventType,
              userId: event.payload.userId,
              userName: event.payload.userName,
            }),
          );

          logger.info({ result }, "account created ");

          return;
        } catch (error) {
          logger.error(
            {
              err: error,
              eventId: event.eventId,
              eventType: event.eventType,
              retryCount: error.retryCount,
            },
            "Failed to process UserRegistered event",
          );

          await publishDLQ({ event, error, attempt: error.retryCount });

          return;
        }
      }

      const error = new Error(
        `Unsupported Kafka event type: ${event.eventType}`,
      );

      error.code = "UNSUPPORTED_EVENT_TYPE";

      logger.warn(
        {
          eventId: event.eventId,
          eventType: event.eventType,
        },
        "Unsupported Kafka event type",
      );

      await publishDLQ({
        event,
        error,
        attempt: 0,
        topic,
        partition,
        offset: message.offset,
      });

      return;
    },
  });
};

module.exports = { connectConsumer, runConsumer };
