const { getTransaction } = require("./blockchain.provider");

const run = async () => {
  console.log("TX 001:");
  console.log(await getTransaction({ txHash: "sim_tx_001" }));

  console.log("TX 002:");
  console.log(await getTransaction({ txHash: "sim_tx_002" }));

  console.log("PENDING TX:");
  console.log(await getTransaction({ txHash: "sim_tx_pending" }));

  console.log("UNKNOWN TX:");
  console.log(await getTransaction({ txHash: "unknown_tx" }));
};

run();