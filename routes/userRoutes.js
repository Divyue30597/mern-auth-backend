import { Router } from "express";
import {
  createNewUser,
  deleteUser,
  getAllUser,
  updateUser,
} from "../controllers/usersController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

export function userRoute() {
  const router = Router();

  router.route("/").post(createNewUser);

  router.use(verifyJWT);

  router.route("/").get(getAllUser).patch(updateUser).delete(deleteUser);

  return router;
}
