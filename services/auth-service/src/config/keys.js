const fs = require("fs");
const path = require("path");
const { importSPKI, exportJWK } = require("jose");

const publicKey = fs.readFileSync(
  path.join(__dirname, "../../keys/access-token-public.pem"),
  "utf8",
);

const getPublicJWK = async () => {
  const key = await importSPKI(publicKey, "RS256");

  const jwk = await exportJWK(key);
  return { ...jwk, kid: "access-token-key-1", use: "sig", alg: "RS256" };
};

module.exports = getPublicJWK;
