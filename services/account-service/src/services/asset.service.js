const assetRepository = require("../repositories/asset.repository");

const getAllAssets = async ({ assetType, status } = {}) => {
  return assetRepository.getAllAssets({ assetType, status });
};

const getAssetById = async ({ assetId }) => {
  return assetRepository.getAssetById({ assetId });
};

const createAsset = async ({ symbol, name, assetType, decimals, status }) => {
  return assetRepository.createAsset({
    symbol,
    name,
    assetType,
    decimals,
    status,
  });
};

const updateAsset = async ({ name, status, assetId }) => {
  return assetRepository.updateAsset({ name, status, assetId });
};

module.exports = { getAllAssets, getAssetById, createAsset, updateAsset };
