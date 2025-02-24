import express, { Request, Response, NextFunction } from "express";

import validatorHandler from "../middlewares/validator.handler";
import { validateEmail } from "../schemas/auth.schema";
import { AuthService } from "../services/auth.service";

const router = express.Router();
const service = new AuthService();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints relacionados con la autenticación
 *
 * /auth:
 *   post:
 *     summary: Autentica al usuario y genera un JWT.
 *     description: >
 *       Este endpoint recibe un objeto JSON con el email del usuario, valida el input y,
 *       si es correcto, genera un token JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *     responses:
 *       200:
 *         description: Token generado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Error en la validación del input.
 *       500:
 *         description: Error interno del servidor.
 */

router.post(
  "/",
  validatorHandler(validateEmail, "body"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.params;
      const user = await service.getUserForLogin(email);
      const response = service.signToken(user);
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
