const { producer } = require("../config/kafka");
const KAFKA_TOPICS = require("../config/kafkaTopics");

const publishDLQ = async ({
  event = null,
  error,
  attempt = 0,
  rawValue = null,
  topic = null,
  partition = null,
  offset = null,
}) => {
  await producer.send({
    topic: KAFKA_TOPICS.USER_EVENTS_DLQ,
    messages: [
      {
        key: event?.eventId || null,
        value: JSON.stringify({
          event: event || null,
          rawValue,
          kafka: { topic, partition, offset },
          retry: {
            attempt,
          },
          dlq: {
            error: error.message,
            errorCode: error.code || null,
            failedAt: new Date().toISOString(),
          },
        }),
      },
    ],
  });
};

module.exports = {
  publishDLQ,
};
