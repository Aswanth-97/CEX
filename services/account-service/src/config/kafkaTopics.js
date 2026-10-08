const KAFKA_TOPICS = {
  USER_EVENTS: "user-events",

  USER_EVENTS_RETRY_1: "user-events.retry.1",
  USER_EVENTS_RETRY_2: "user-events.retry.2",
  USER_EVENTS_RETRY_3: "user-events.retry.3",

  USER_EVENTS_DLQ: "user-events.dlq",
};

module.exports = KAFKA_TOPICS;
