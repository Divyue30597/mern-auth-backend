import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

import User from "../models/User.js";

/**
 * @desc    Login
 * @route   POST /auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  // Get username and password from the user
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  // Look for the user. If not found or inactive, say Unauthorized.
  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // comparing the password in the database with the one got in the request.
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const accessToken = jwt.sign(
    {
      userInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30m",
    }
  );

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).send({ accessToken, roles: foundUser.roles });
});

/**
 * @desc        Login
 * @route       POST /auth/refresh
 * @access      Public
 * @reasoning   refresh token should issue a new access token if refresh token is valid.
 */
export const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies.jwt) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err)
        return res.status(403).json({
          message: "Forbidden",
        });

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const accessToken = jwt.sign(
        {
          userInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );

      res.status(200).json({ roles: foundUser.roles, accessToken });
    })
  );
});

/**
 * @desc    Login
 * @route   POST /auth/logout
 * @access  Public
 */
export const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    // Sending the status even if the cookie does not exist.
    return res.sendStatus(204);
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({
    message: "cookie cleared",
  });
});
