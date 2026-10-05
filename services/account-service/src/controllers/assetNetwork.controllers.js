const assetNetworkService = require("../services/assetNetwork.service");

const getAllAssetNetworks = async (req, res, next) => {
  try {
    const result = await assetNetworkService.getAllAssetNetworks();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getAssetNetworkById = async (req, res, next) => {
  const { assetNetworkId } = req.params;

  try {
    const network = await assetNetworkService.getAssetNetworkById({
      assetNetworkId,
    });

    if (!network) {
      const error = new Error("Asset netwok not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: network });
  } catch (error) {
    next(error);
  }
};

const createAssetNetwork = async (req, res, next) => {
  const { network, networkName, status, assetId } = req.body;

  try {
    const result = await assetNetworkService.createAssetNetwork({
      assetId,
      network,
      networkName,
      status,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateAssetNetwork = async (req, res, next) => {
  const { networkName, status } = req.body;
  const { assetNetworkId } = req.params;
  try {
    const update = await assetNetworkService.updateAssetNetwork({
      assetNetworkId,
      networkName,
      status,
    });

    if (!update) {
      const error = new Error("Asset network not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: update });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAssetNetworks,
  getAssetNetworkById,
  updateAssetNetwork,
  createAssetNetwork,
};
