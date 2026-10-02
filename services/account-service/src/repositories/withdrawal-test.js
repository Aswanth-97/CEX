const withdrawalRepository = require("./withdrawals.repository");

const run = async () => {
  const withdrawal = await withdrawalRepository.createWithdrawal({
    accountId: "269d8c71-3d22-490f-b3b4-8963286003cf",
    assetId: "3f9ffa45-5ecb-4103-a692-487b42c8ab03",
    amount: "0.2",
    destination: "user_external_btc_address_001",
  });

  console.log(withdrawal);
};

run();
