const assetNetworkRepository = require("../repositories/assetNetwork.repository");

const getAllAssetNetworks = async ({ assetId, status } = {}) => {
  return assetNetworkRepository.getAllAssetNetworks({ assetId, status });
};

const getAssetNetworkById = async ({ assetNetworkId }) => {
  return assetNetworkRepository.getAssetNetworkById({ assetNetworkId });
};

const createAssetNetwork = async ({
  assetId,
  network,
  networkName,
  status,
}) => {
  return assetNetworkRepository.createAssetNetwork({
    assetId,
    network,
    networkName,
    status,
  });
};

const updateAssetNetwork = async ({ assetNetworkId, networkName, status }) => {
  return assetNetworkRepository.updateAssetNetwork({
    assetNetworkId,
    networkName,
    status,
  });
};

module.exports = {
  getAssetNetworkById,
  getAllAssetNetworks,
  createAssetNetwork,
  updateAssetNetwork,
};
