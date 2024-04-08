import { Router } from "express";
import {
  createNewNote,
  deleteNote,
  getAllNotes,
  updateNote,
} from "../controllers/noteController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

export function notesRoute() {
  const router = Router();

  router.use(verifyJWT);

  router
    .route("/")
    .get(getAllNotes)
    .post(createNewNote)
    .patch(updateNote)
    .delete(deleteNote);

  return router;
}
