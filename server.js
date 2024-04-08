import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { connectDb } from "./config/dbConn.js";
import { corsOptions } from "./config/coorsOptions.js";
import { root } from "./routes/root.js";
import { logger, logEvents } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/authRoutes.js";
import { userRoute } from "./routes/userRoutes.js";
import { notesRoute } from "./routes/noteRoutes.js";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);

const app = express();

const PORT = process.env.PORT;

connectDb();

app.use(logger);

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", root());
app.use("/auth", authRoutes());
app.use("/users", userRoute());
app.use("/notes", notesRoute());

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({
      message: "404 Not Found",
    });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to Database");
  app.listen(PORT, () => {
    console.log(`Server is running on the port: ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
