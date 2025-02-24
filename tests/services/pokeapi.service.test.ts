import { PokeapiService } from "../../src/services/pokeapi.service";
import { CreateCharacter } from "../../src/interfaces/merged.types";

describe("Prueba de PokeapiService - findMatchingPokemon", () => {
  let pokeapiService: PokeapiService;

  beforeEach(() => {
    pokeapiService = new PokeapiService();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Debería retornar el Pokémon que mejor coincide con el personaje según color, altura y peso", async () => {
    const characterData: CreateCharacter = {
      name: "Test Character 1",
      height: "170",
      mass: "70",
      eye_color: "blue",
      gender: "male",
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          pokemon_species: [
            {
              name: "bulbasaur",
              url: "https://pokeapi.co/api/v2/pokemon/bulbasaur",
            },
            {
              name: "charmander",
              url: "https://pokeapi.co/api/v2/pokemon/charmander",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          name: "bulbasaur",
          height: 7,
          weight: 69,
          types: [{ type: { name: "grass" } }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          name: "charmander",
          height: 10,
          weight: 150,
          types: [{ type: { name: "fire" } }],
        }),
      });

    const result = await pokeapiService.findMatchingPokemon(characterData);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon-color/blue",
    );
    expect(result).toEqual({
      name: "charmander",
      height: 100,
      weight: 15,
      type: "fire",
    });
  });

  test("Debería retornar null si la respuesta del endpoint de color no es exitosa", async () => {
    const characterData: CreateCharacter = {
      name: "Test Character 2",
      height: "170",
      mass: "70",
      eye_color: "red",
      gender: "male",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await pokeapiService.findMatchingPokemon(characterData);
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "No se pudo obtener la lista de Pokémon por color",
    );

    consoleSpy.mockRestore();
  });

  test("Debería ignorar las respuestas de detalles de Pokémon que no sean exitosas", async () => {
    const characterData: CreateCharacter = {
      name: "Test Character 3",
      height: "170",
      mass: "70",
      eye_color: "yellow",
      gender: "male",
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          pokemon_species: [
            {
              name: "pikachu",
              url: "https://pokeapi.co/api/v2/pokemon/pikachu",
            },
            {
              name: "squirtle",
              url: "https://pokeapi.co/api/v2/pokemon/squirtle",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          name: "squirtle",
          height: 5,
          weight: 90,
          types: [{ type: { name: "water" } }],
        }),
      });

    const result = await pokeapiService.findMatchingPokemon(characterData);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon-color/yellow",
    );
    expect(result).toEqual({
      name: "squirtle",
      height: 50,
      weight: 9,
      type: "water",
    });
  });

  test("Debería propagar un error si ocurre una excepción", async () => {
    const characterData: CreateCharacter = {
      name: "Test Character 4",
      height: "170",
      mass: "70",
      eye_color: "green",
      gender: "male",
    };

    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    await expect(
      pokeapiService.findMatchingPokemon(characterData),
    ).rejects.toThrow("Error al buscar el pokemon: Network error");
  });
});
