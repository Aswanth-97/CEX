const assetRepo = require("../repositories/asset.repository");

const getAllAssets = async () => {
  return assetRepo.getAllAssets();
};

module.exports = { getAllAssets };
