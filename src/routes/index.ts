import express, { Application } from "express";
import passport from "passport";

import authRouter from "./auth.routes";
import mergedRouter from "./merged.routes";

export function routerApi(app: Application) {
  const router = express.Router();
  app.use("/api", router);

  router.use("/auth", authRouter);

  router.use(
    "/",
    passport.authenticate("jwt", { session: false }),
    mergedRouter,
  );
}
