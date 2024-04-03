import { Router } from "express";
import {
  createNewUser,
  deleteUser,
  getAllUser,
  updateUser,
} from "../controllers/usersController.js";

export function userRoute() {
  const router = Router();

  router
    .route("/")
    .get(getAllUser)
    .post(createNewUser)
    .patch(updateUser)
    .delete(deleteUser);

  return router;
}
