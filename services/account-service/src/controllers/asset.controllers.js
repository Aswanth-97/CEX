const assetService = require("../services/asset.service");

const getAllAssets = async (req, res, next) => {
  const { assetType, status } = req.query;
  try {
    const assets = await assetService.getAllAssets({ assetType, status });

    res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

const getAssetById = async (req, res, next) => {
  const { assetId } = req.params;
  try {
    const asset = await assetService.getAssetById({ assetId });

    if (!asset) {
      const error = new Error("asset not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

const createAsset = async (req, res, next) => {
  const { symbol, name, assetType, decimals, status } = req.body;

  try {
    const asset = await assetService.createAsset({
      symbol,
      name,
      assetType,
      decimals,
      status,
    });
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

const updateAsset = async (req, res, next) => {
  const { assetId } = req.params;
  const { name, status } = req.body;

  try {
    const update = await assetService.updateAsset({ name, status, assetId });

    if (!update) {
      const error = new Error("asset not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: update });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
};
