const assert = require("node:assert");
const { withRetry } = require("../src/utils/retry")

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
};

// 1. Non-retryable error
test("does not retry non-retryable errors", async () => {
  let executions = 0;

  await assert.rejects(
    withRetry(async () => {
      executions += 1;

      const error = new Error("Validation failed");
      error.code = "23505";

      throw error;
    }),
  );

  assert.strictEqual(executions, 1);
});

// 2. Retryable error, then success
test("retries and succeeds", async () => {
  let executions = 0;

  const result = await withRetry(async () => {
    executions += 1;

    if (executions === 1) {
      const error = new Error("Connection reset");
      error.code = "ECONNRESET";
      throw error;
    }

    return "success";
  });

  assert.strictEqual(result, "success");
  assert.strictEqual(executions, 2);
});

// 3. Retryable error every time
test("stops after maximum retries", async () => {
  let executions = 0;

  await assert.rejects(
    withRetry(async () => {
      executions += 1;

      const error = new Error("Database unavailable");
      error.code = "ECONNREFUSED";

      throw error;
    }),
  );

  assert.strictEqual(executions, 4);
});