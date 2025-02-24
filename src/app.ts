import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger";
import rateLimit from "express-rate-limit";

import { routerApi } from "./routes/index";
import {
  logErrors,
  errorHandler,
  boomErrorHandler,
} from "./middlewares/error.handler";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

import "./utils/auth-strategies";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get("/", async (_req, res) => {
  res.send("Hola mundo");
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

routerApi(app);

app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
