import { SwapiService } from "../../src/services/swapi.service";

describe("Prueba de SwapiService - getCharacter", () => {
  let swapiService: SwapiService;

  beforeEach(() => {
    swapiService = new SwapiService();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Debería retornar los datos del personaje de Start Wars eliminando propiedades innecesarias", async () => {
    const fakeCharacterData = {
      name: "Luke Skywalker",
      height: "172",
      mass: "77",
      hair_color: "blond",
      skin_color: "fair",
      eye_color: "blue",
      birth_year: "19BBY",
      gender: "male",
      homeworld: "https://swapi.dev/api/planets/1/",
      url: "https://swapi.dev/api/people/1/",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(fakeCharacterData),
    });

    const character = await swapiService.getCharacter("1");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://swapi.dev/api/people/1/",
    );

    expect(character).not.toHaveProperty("films");
    expect(character).not.toHaveProperty("species");
    expect(character).not.toHaveProperty("vehicles");
    expect(character).not.toHaveProperty("starships");
    expect(character).not.toHaveProperty("created");
    expect(character).not.toHaveProperty("edited");

    Object.entries(fakeCharacterData).forEach(([key, value]) => {
      expect(character).toHaveProperty(key, value);
    });
  });

  test("Debería lanzar un error NotFound cuando fetch retorna ok en false", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const idCharacter = "100";

    await expect(swapiService.getCharacter(idCharacter)).rejects.toThrow(
      /El personaje con el id 100 no existe/,
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `https://swapi.dev/api/people/${idCharacter}/`,
    );
  });

  test("Debería propagar errores lanzados por fetch", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    await expect(swapiService.getCharacter("3")).rejects.toThrow(
      "Network error",
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://swapi.dev/api/people/3/",
    );
  });
});
