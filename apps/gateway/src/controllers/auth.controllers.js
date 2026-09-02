const {
  checkAuthHealth,
  registerUser,
  login,
  refresh,
  logout,
} = require("../services/auth.service");

const getAuthHealth = async (req, res, next) => {
  try {
    const response = await checkAuthHealth();
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
};

const registration = async (req, res, next) => {
  const { userName, email, password } = req.body;

  try {
    const response = await registerUser(userName, email, password);
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const response = await login(email, password);

    const { refreshToken, accessToken, userName, id } = response.data.result;

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(response.status).json({
      userName: userName,
      accessToken: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const tokenRefresh = async (req, res, next) => {
  try {
    const refreshtoken = req.cookies.refreshToken;

    if (!refreshtoken) {
      const error = new Error("RefreshToken not found");
      error.statusCode = 401;
      throw error;
    }

    const response = await refresh(refreshtoken);

    const { newAccessToken, newRefreshToken } = response.data.result;

    res.cookie("refreshToken", newRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(response.status).json({
      message: "Access token refreshed successfully",
      newAccessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

const userLogOut = async (req, res, next) => {
  try {
    const refreshtoken = req.cookies.refreshToken;

    if (!refreshtoken) {
      const error = new Error("RefreshToken not found");
      error.statusCode = 401;
      throw error;
    }

    const response = await logout(refreshtoken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
};

const me = (req, res, next) => {
  res.json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  getAuthHealth,
  registration,
  userLogin,
  tokenRefresh,
  userLogOut,
  me,
};
