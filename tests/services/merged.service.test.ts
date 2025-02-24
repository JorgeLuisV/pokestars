import crypto from "crypto";

import dynamoDB from "../../src/libs/dynamodb";
import { MergedService } from "../../src/services/merged.service";
import { CacheService } from "../../src/services/cache.service";
import { Character, CreateCharacter } from "../../src/interfaces/merged.types";

describe("Prueba de MergedService", () => {
  let mergedService: MergedService;
  const fixedUUID = "b1b3acba-16a4-435a-88ec-642e58fa459d";
  const fixedTime = 1000000000;

  beforeEach(() => {
    mergedService = new MergedService();

    jest.spyOn(crypto, "randomUUID").mockReturnValue(fixedUUID);
    jest.spyOn(Date, "now").mockReturnValue(fixedTime);

    (dynamoDB.send as jest.Mock) = jest.fn().mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Prueba de mergeCharacters", () => {
    test("Debe fusionar los personajes usando datos en caché cuando estos existen", async () => {
      const cachedCharacter: Character = {
        id: "cached-id",
        name: "Cached Character",
        height: "170",
        mass: "70",
        gender: "male",
        timestamp: fixedTime - 500,
      };

      jest
        .spyOn(CacheService, "getCachedCharacter")
        .mockResolvedValue(cachedCharacter);

      const createCharacterSpy = jest
        .spyOn(mergedService, "createCharacter")
        .mockImplementation(async (data: CreateCharacter) => ({
          ...data,
          id: fixedUUID,
          timestamp: fixedTime,
        }));

      const result = await mergedService.mergeCharacters("123");

      expect(CacheService.getCachedCharacter).toHaveBeenCalledWith("123");
      expect(createCharacterSpy).toHaveBeenCalledWith(cachedCharacter);
      expect(result).toEqual({
        ...cachedCharacter,
        id: fixedUUID,
        timestamp: fixedTime,
      });
    });

    test("Debe fusionar el personaje cuando NO existe caché, usando Swapi y Pokeapi", async () => {
      jest.spyOn(CacheService, "getCachedCharacter").mockResolvedValue(null);

      const swapiCharacter = {
        name: "Swapi Character",
        height: "180",
        mass: "80",
        gender: "male",
      };
      (mergedService as any).swapiService.getCharacter = jest
        .fn()
        .mockResolvedValue(swapiCharacter);

      const matchingPokemon = {
        name: "Pikachu",
        height: 40,
        weight: 6,
        type: "electric",
      };
      (mergedService as any).pokeapiService.findMatchingPokemon = jest
        .fn()
        .mockResolvedValue(matchingPokemon);

      jest.spyOn(CacheService, "cacheCharacter").mockResolvedValue();

      const createCharacterSpy = jest
        .spyOn(mergedService, "createCharacter")
        .mockImplementation(async (data: CreateCharacter) => ({
          ...data,
          id: fixedUUID,
          timestamp: fixedTime,
        }));

      const result = await mergedService.mergeCharacters("456");

      expect(CacheService.getCachedCharacter).toHaveBeenCalledWith("456");
      expect(
        (mergedService as any).swapiService.getCharacter,
      ).toHaveBeenCalledWith("456");
      expect(
        (mergedService as any).pokeapiService.findMatchingPokemon,
      ).toHaveBeenCalledWith(swapiCharacter);
      expect(CacheService.cacheCharacter).toHaveBeenCalledWith("456", {
        ...swapiCharacter,
        matching_pokemon: matchingPokemon,
      });
      expect(createCharacterSpy).toHaveBeenCalledWith({
        ...swapiCharacter,
        matching_pokemon: matchingPokemon,
      });
      expect(result).toEqual({
        ...swapiCharacter,
        matching_pokemon: matchingPokemon,
        id: fixedUUID,
        timestamp: fixedTime,
      });
    });

    test("Debe propagar error si falla la fusión de personajes", async () => {
      jest
        .spyOn(CacheService, "getCachedCharacter")
        .mockRejectedValue(new Error("Cache error"));

      await expect(mergedService.mergeCharacters("789")).rejects.toThrow(
        "Error fusionando personajes: Cache error",
      );
    });
  });

  describe("Prueba de createCharacter", () => {
    test("Debe crear el personaje exitosamente", async () => {
      const createData: CreateCharacter = {
        name: "New Character",
        height: "160",
        mass: "60",
        gender: "female",
      };

      const result = await mergedService.createCharacter(createData);

      const expected = {
        ...createData,
        dummy: "record",
        id: fixedUUID,
        timestamp: fixedTime,
      };

      expect(dynamoDB.send).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    test("Debe lanzar error si dynamoDB.send falla en createCharacter", async () => {
      (dynamoDB.send as jest.Mock).mockRejectedValue(new Error("DB error"));

      const createData: CreateCharacter = {
        name: "New Character",
        height: "160",
        mass: "60",
        gender: "female",
      };

      await expect(mergedService.createCharacter(createData)).rejects.toThrow(
        "Error al crear el personaje: DB error",
      );
    });
  });

  describe("Pruebas de getHistory", () => {
    test("Debe retornar el historial cuando se retorna Items y LastEvaluatedKey", async () => {
      const fakeItems = [
        { id: "1", name: "Character1" },
        { id: "2", name: "Character2" },
      ];
      const fakeLastEvaluatedKey = { id: "2", timestamp: 12345 };

      (dynamoDB.send as jest.Mock).mockResolvedValue({
        Items: fakeItems,
        LastEvaluatedKey: fakeLastEvaluatedKey,
      });

      const response = await mergedService.getHistory(undefined, 10);

      expect(response).toEqual({
        items: fakeItems,
        lastEvaluatedKey: fakeLastEvaluatedKey,
      });
    });

    test("Debe retornar items vacíos si no se retorna Items y LastEvaluatedKey", async () => {
      (dynamoDB.send as jest.Mock).mockResolvedValue({});

      const response = await mergedService.getHistory(undefined, 10);

      expect(response).toEqual({
        items: [],
        lastEvaluatedKey: undefined,
      });
    });

    test("Debe lanzar error si dynamoDB.send falla", async () => {
      (dynamoDB.send as jest.Mock).mockRejectedValue(new Error("Scan error"));

      await expect(mergedService.getHistory(undefined, 10)).rejects.toThrow(
        "No se pudo obtener el historial: Scan error",
      );
    });

    test("Debe incluir ExclusiveStartKey cuando se provee", async () => {
      const fakeExclusiveStartKey = { id: "lastKey", timestamp: 54321 };
      (dynamoDB.send as jest.Mock).mockResolvedValue({
        Items: [{ id: "3", name: "Character3" }],
        LastEvaluatedKey: fakeExclusiveStartKey,
      });

      const response = await mergedService.getHistory(fakeExclusiveStartKey, 5);

      expect(response).toEqual({
        items: [{ id: "3", name: "Character3" }],
        lastEvaluatedKey: fakeExclusiveStartKey,
      });
    });
  });
});
