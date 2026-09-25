const { Kafka } = require("kafkajs");
const { KAFKA_BROKERS } = require("./env");

const kafka = new Kafka({
  clientId: "outbox-publisher",
  brokers: KAFKA_BROKERS,
});

const producer = kafka.producer();

module.exports = producer;
