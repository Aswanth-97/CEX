const assetService = require("../services/asset.service");

const getAllAssets = async (req, res, next) => {
  try {
    const assets = await assetService.getAllAssets();

    res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAssets,
};
