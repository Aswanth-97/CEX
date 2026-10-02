// const { verifyDeposit } = require("./deposit.service");

// const run = async () => {
//   const result = await verifyDeposit({
//     depositId: "c0653d39-17b7-4b3e-a392-8a80868dde4a",
//   });

//   console.log(result);
// };

// run();

const withdrawalService = require("./withdrawal.service");

const ACCOUNT_ID = "269d8c71-3d22-490f-b3b4-8963286003cf";

const WITHDRAWAL_ID = "d8022d0b-1c96-43f3-9039-8da35ebaedc2";

const run = async () => {
  try {
    const result = await withdrawalService.completeWithdrawal({
      accountId: ACCOUNT_ID,
      withdrawalId: WITHDRAWAL_ID,
    });

    console.log("Withdrawal processed:");
    console.dir(result, { depth: null });
  } catch (error) {
    console.error("Withdrawal failed:");
    console.error(error.message);
  }
};

run();
