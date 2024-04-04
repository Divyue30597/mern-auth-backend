import { Router } from "express";

export function notesRoute() {
  const router = Router();

  router
    .route("/")
    .get()
    .post()
    .patch()
    .delete()
}
