import express, { Request, Response, NextFunction } from "express";

import { MergedService } from "../services/merged.service";
import validatorHandler from "../middlewares/validator.handler";
import {
  validateCharacterId,
  validateCharacter,
  validateHistoryPagination,
} from "../schemas/merged.schema";

const router = express.Router();
const service = new MergedService();

/**
 * @openapi
 * /fusionados/{characterId}:
 *   get:
 *     summary: Fusionar datos de un personaje
 *     description: Fusiona información de un personaje utilizando múltiples servicios de SwapiService y PokeapiService basándose en coincidencias de color, altura y peso.
 *     parameters:
 *       - in: path
 *         name: characterId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del personaje a fusionar.
 *     responses:
 *       200:
 *         description: Retorna los datos del personaje fusionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "227d1f8c-0b10-45a3-9930-e223be1caf3c"
 *                 name:
 *                   type: string
 *                   example: "Darth Vader"
 *                 height:
 *                   type: string
 *                   example: "202"
 *                 mass:
 *                   type: string
 *                   example: "136"
 *                 hair_color:
 *                   type: string
 *                   example: "none"
 *                 skin_color:
 *                   type: string
 *                   example: "white"
 *                 eye_color:
 *                   type: string
 *                   example: "yellow"
 *                 birth_year:
 *                   type: string
 *                   example: "41.9BBY"
 *                 gender:
 *                   type: string
 *                   example: "male"
 *                 homeworld:
 *                   type: string
 *                   example: "https://swapi.dev/api/planets/1/"
 *                 url:
 *                   type: string
 *                   example: "https://swapi.dev/api/people/4/"
 *                 matching_pokemon:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "exeggutor"
 *                     height:
 *                       type: number
 *                       example: 200
 *                     weight:
 *                       type: number
 *                       example: 120
 *                     type:
 *                       type: string
 *                       example: "grass, psychic"
 *                 timestamp:
 *                   type: number
 *                   example: 1740348411946
 *       400:
 *         description: Error en la solicitud, por ejemplo, si el characterId es inválido.
 *       500:
 *         description: Error interno del servidor.
 */

router.get(
  "/fusionados/:characterId",
  validatorHandler(validateCharacterId, "params"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { characterId } = req.params;
      const result = await service.mergeCharacters(characterId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /almacenar:
 *   post:
 *     summary: Almacenar un nuevo personaje
 *     description: Crea y almacena un personaje en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Personaje 1"
 *               height:
 *                 type: string
 *                 example: "170"
 *               mass:
 *                 type: string
 *                 example: "70"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               matching_pokemon:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Pokemon 1"
 *                   height:
 *                     type: number
 *                     example: 120
 *                   weight:
 *                     type: number
 *                     example: 200
 *                   type:
 *                     type: string
 *                     example: "aqua"
 *     responses:
 *       201:
 *         description: Personaje creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "8bcc3a50-1cdc-4e27-b87d-5737917a4f0b"
 *                 name:
 *                   type: string
 *                   example: "pepito 2"
 *                 height:
 *                   type: string
 *                   example: "170"
 *                 mass:
 *                   type: string
 *                   example: "70"
 *                 gender:
 *                   type: string
 *                   example: "male"
 *                 matching_pokemon:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Poke 3"
 *                     height:
 *                       type: number
 *                       example: 120
 *                     weight:
 *                       type: number
 *                       example: 200
 *                     type:
 *                       type: string
 *                       example: "aqua"
 *                 timestamp:
 *                   type: number
 *                   example: 1740352953459
 *       400:
 *         description: Error en la solicitud, datos inválidos.
 *       500:
 *         description: Error interno del servidor.
 */

router.post(
  "/almacenar",
  validatorHandler(validateCharacter, "body"),
  async (req, res) => {
    const result = await service.createCharacter(req.body);
    res.status(201).json(result);
  },
);

/**
 * @openapi
 * /historial:
 *   get:
 *     summary: Obtener historial de fusiones
 *     description: Recupera el historial de fusiones de personajes, permitiendo paginación mediante un límite y una clave de inicio.
 *     parameters:
 *       - in: query
 *         name: lastEvaluatedKey
 *         schema:
 *           type: string
 *         description: Última clave evaluada para paginar el historial (en formato JSON serializado).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de registros a retornar.
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eye_color:
 *                         type: string
 *                         example: "yellow"
 *                       timestamp:
 *                         type: number
 *                         example: 1740348375895
 *                       homeworld:
 *                         type: string
 *                         example: "https://swapi.dev/api/planets/1/"
 *                       hair_color:
 *                         type: string
 *                         example: "n/a"
 *                       birth_year:
 *                         type: string
 *                         example: "112BBY"
 *                       skin_color:
 *                         type: string
 *                         example: "gold"
 *                       url:
 *                         type: string
 *                         example: "https://swapi.dev/api/people/2/"
 *                       name:
 *                         type: string
 *                         example: "C-3PO"
 *                       gender:
 *                         type: string
 *                         example: "n/a"
 *                       mass:
 *                         type: string
 *                         example: "75"
 *                       height:
 *                         type: string
 *                         example: "167"
 *                       matching_pokemon:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "cofagrigus"
 *                           weight:
 *                             type: number
 *                             example: 76.5
 *                           type:
 *                             type: string
 *                             example: "ghost"
 *                           height:
 *                             type: number
 *                             example: 170
 *                       id:
 *                         type: string
 *                         example: "52568c58-1f40-462a-9cef-c634f1ed2041"
 *                 lastEvaluatedKey:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "cedb5b15-7f80-4638-a082-0d84a0c1c66d"
 *                     timestamp:
 *                       type: number
 *                       example: 1740348409553
 *       400:
 *         description: Error en la solicitud, parámetros inválidos.
 *       500:
 *         description: Error interno del servidor.
 */

router.get(
  "/historial",
  validatorHandler(validateHistoryPagination, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lastEvaluatedKey = req.query.lastEvaluatedKey
        ? JSON.parse(req.query.lastEvaluatedKey as string)
        : undefined;
      const limit = req.query.limit ? +req.query.limit : 10;
      const result = await service.getHistory(lastEvaluatedKey, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
