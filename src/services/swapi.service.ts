import boom from "@hapi/boom";

import { Character } from "../interfaces/merged.types";

export class SwapiService {
  private readonly swapi = "https://swapi.dev/api/people/";

  async getCharacter(characterId: string): Promise<Character> {
    const response = await fetch(`${this.swapi}${characterId}/`);
    if (!response.ok) {
      throw boom.notFound(`El personaje con el id ${characterId} no existe`);
    }

    const characterData = await response.json();

    delete characterData.films;
    delete characterData.species;
    delete characterData.vehicles;
    delete characterData.starships;
    delete characterData.created;
    delete characterData.edited;

    return characterData;
  }
}
