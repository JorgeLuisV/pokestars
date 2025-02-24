import {
  CreateCharacter,
  Pokemon,
  PokemonColorResponse,
  PokemonType,
} from "../interfaces/merged.types";

export class PokeapiService {
  private readonly pokeapi = "https://pokeapi.co/api/v2/";

  async findMatchingPokemon(
    characterData: CreateCharacter,
  ): Promise<Pokemon | null> {
    try {
      const colorResponse = await fetch(
        `${this.pokeapi}pokemon-color/${characterData.eye_color}`,
      );

      if (!colorResponse.ok) {
        console.error("No se pudo obtener la lista de Pokémon por color");
        return null;
      }

      const colorData: PokemonColorResponse = await colorResponse.json();
      const pokemonList = colorData.pokemon_species.map((p) => p.name);

      const pokemonDetailsPromises = pokemonList.map(async (pokemonName) => {
        const response = await fetch(`${this.pokeapi}pokemon/${pokemonName}`);
        if (!response.ok) return null;
        return response.json();
      });

      const pokemonDetails = (await Promise.all(pokemonDetailsPromises)).filter(
        (p) => p !== null,
      );

      let bestMatch = null;
      let minDifference = Infinity;

      for (const pokemonData of pokemonDetails) {
        const heightCm = pokemonData.height * 10;
        const weightKg = pokemonData.weight / 10;

        const heightDiff = Math.abs(+characterData.height - heightCm);
        const weightDiff = Math.abs(+characterData.mass - weightKg);
        const totalDiff = heightDiff + weightDiff;

        if (totalDiff < minDifference) {
          minDifference = totalDiff;
          bestMatch = {
            name: pokemonData.name,
            height: heightCm,
            weight: weightKg,
            type: pokemonData.types
              .map((t: PokemonType) => t.type.name)
              .join(", "),
          };
        }
      }

      if (!bestMatch && pokemonDetails.length > 0) {
        const randomPokemon =
          pokemonDetails[Math.floor(Math.random() * pokemonDetails.length)];

        bestMatch = {
          name: randomPokemon.name,
          height: randomPokemon.height * 10,
          weight: randomPokemon.weight / 10,
          type: (randomPokemon.types as PokemonType[])
            .map((t) => t.type.name)
            .join(", "),
        };
      }

      return bestMatch;
    } catch (error) {
      throw new Error(
        `Error al buscar el pokemon: ${(error as Error).message}`,
      );
    }
  }
}
