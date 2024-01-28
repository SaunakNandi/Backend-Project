import express from "express";
import cors from "cors"; // cross origin share
import cookieParser from "cookie-parser";

const app = express();

// Mounts the specified middleware function (cors in this case) at the specified path. If no path is specified, it defaults to the root path ("/").
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Configuration in express [Explained in notes -> marker app.use]
app.use(express.json({ limit: "16kb" })); // limiting the size of JSON

// if we search for `Call of Duty` the search url get encoded and inplace of space %20 get appended. This way we are telling express
// to understand this type of url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // keeping assets stored in server. For this we are maknig a public folder(publc folder was already created)

app.use(cookieParser()); // for cookies

// routes import

import userRouter from "./routes/user.routes.js";

// routes declaration
// to call routers we will use middleware
app.use("/api/v1/users", userRouter); // localhost:8000/api/v1/users/register or /api/v1/users/login

export { app };
