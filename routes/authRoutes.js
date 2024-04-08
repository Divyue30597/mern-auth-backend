import { Router } from "express";
import { loginLimiter } from "../middleware/loginLimiter.js";
import { login, logout, refresh } from "../controllers/authController.js";

export function authRoutes() {
  const router = Router();

  // router.route("/").post(loginLimiter, login);
  router.route("/").post(login);

  router.route("/refresh").get(refresh);

  router.route("/logout").post(logout);

  return router;
}
