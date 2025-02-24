import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { CacheService } from "../../src/services/cache.service";
import dynamoDB from "../../src/libs/dynamodb";
import { Character } from "../../src/interfaces/merged.types";

describe("Prueba de CacheService - getCachedCharacter", () => {
  beforeEach(() => {
    (dynamoDB.send as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Retorna el personaje parseado si existe en caché y su tiempo no ha expirado", async () => {
    const now = 1000000000;
    const dateSpy = jest.spyOn(Date, "now").mockReturnValue(now);

    const fakeCharacter: Character = {
      id: "123",
      name: "Test Character",
      height: "170",
      mass: "70",
      gender: "male",
      timestamp: now,
    };

    const fakeItem = {
      data: JSON.stringify(fakeCharacter),
      timestamp: now - 100,
    };

    (dynamoDB.send as jest.Mock).mockResolvedValue({ Item: fakeItem });

    const result = await CacheService.getCachedCharacter("123");
    expect(result).toEqual(fakeCharacter);

    dateSpy.mockRestore();
  });

  test("Retorna null si no existe el item en caché", async () => {
    (dynamoDB.send as jest.Mock).mockResolvedValue({});

    const result = await CacheService.getCachedCharacter("456");
    expect(result).toBeNull();
  });

  test("Retorna null si el item en caché ha expirado", async () => {
    const now = 1000000000;
    const dateSpy = jest.spyOn(Date, "now").mockReturnValue(now);

    const fakeItem = {
      data: JSON.stringify({
        id: "789",
        name: "Expired Character",
        height: "170",
        mass: "70",
        gender: "male",
      }),
      timestamp: now - (30 * 60 * 1000 + 100),
    };

    (dynamoDB.send as jest.Mock).mockResolvedValue({ Item: fakeItem });

    const result = await CacheService.getCachedCharacter("789");
    expect(result).toBeNull();

    dateSpy.mockRestore();
  });

  test("Propaga error si dynamoDB.send lanza excepción en getCachedCharacter", async () => {
    (dynamoDB.send as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(CacheService.getCachedCharacter("123")).rejects.toThrow(
      "Error al obtener personaje del caché: DB error",
    );
  });
});

describe("Prueba de CacheService - cacheCharacter", () => {
  beforeEach(() => {
    (dynamoDB.send as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Guarda en caché el personaje correctamente", async () => {
    const now = 1000000000;
    const dateSpy = jest.spyOn(Date, "now").mockReturnValue(now);

    const fakeCharacter: Character = {
      id: "321",
      name: "Cache Test",
      height: "180",
      mass: "80",
      gender: "female",
      timestamp: now,
    };

    (dynamoDB.send as jest.Mock).mockResolvedValue({});

    await CacheService.cacheCharacter("321", fakeCharacter);

    expect(dynamoDB.send).toHaveBeenCalled();
    const commandArg = (dynamoDB.send as jest.Mock).mock.calls[0][0];
    expect(commandArg.input.TableName).toEqual("Cache");

    expect(commandArg).toBeInstanceOf(PutCommand);

    dateSpy.mockRestore();
  });

  test("Propaga error si dynamoDB.send lanza excepción en cacheCharacter", async () => {
    const fakeCharacter: Character = {
      id: "321",
      name: "Cache Test",
      height: "180",
      mass: "80",
      gender: "female",
      timestamp: 0,
    };

    (dynamoDB.send as jest.Mock).mockRejectedValue(new Error("DB put error"));

    await expect(
      CacheService.cacheCharacter("321", fakeCharacter),
    ).rejects.toThrow("Error al guardar en caché: DB put error");
  });
});
