const { Kafka } = require("kafkajs");
const { KAFKA_BROKERS } = require("./env");

const kafka = new Kafka({
  clientId: "account-service",
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: "account-service" });

const producer = kafka.producer();

module.exports = { consumer, producer };
