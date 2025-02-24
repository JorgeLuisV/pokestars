import {
  PutCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

import dynamoDB from "../libs/dynamodb";
import { SwapiService } from "./swapi.service";
import { PokeapiService } from "./pokeapi.service";
import { CacheService } from "./cache.service";
import {
  Character,
  CreateCharacter,
  GetRecordsResponse,
} from "../interfaces/merged.types";

export class MergedService {
  private readonly collection = "Merged";

  private swapiService: SwapiService;
  private pokeapiService: PokeapiService;

  constructor() {
    this.swapiService = new SwapiService();
    this.pokeapiService = new PokeapiService();
  }

  async mergeCharacters(characterId: string): Promise<Character> {
    try {
      const cachedData = await CacheService.getCachedCharacter(characterId);
      if (cachedData) {
        const newCharacter = await this.createCharacter(cachedData);
        return newCharacter;
      }

      const characterData = await this.swapiService.getCharacter(characterId);
      const matchingPokemon =
        await this.pokeapiService.findMatchingPokemon(characterData);
      if (matchingPokemon) {
        characterData.matching_pokemon = matchingPokemon;
      }

      await CacheService.cacheCharacter(characterId, characterData);
      const newCharacter = await this.createCharacter(characterData);

      return newCharacter;
    } catch (error) {
      throw new Error(
        `Error fusionando personajes: ${(error as Error).message}`,
      );
    }
  }

  async createCharacter(characterData: CreateCharacter): Promise<Character> {
    try {
      const data = {
        id: randomUUID(),
        ...characterData,
        dummy: "record",
        timestamp: Date.now(),
      };

      const command = new PutCommand({
        TableName: this.collection,
        Item: data,
      });

      await dynamoDB.send(command);

      return data;
    } catch (error) {
      throw new Error(
        `Error al crear el personaje: ${(error as Error).message}`,
      );
    }
  }

  async getHistory(
    lastEvaluatedKey: QueryCommandInput["ExclusiveStartKey"],
    limit: number,
  ): Promise<GetRecordsResponse> {
    const params: QueryCommandInput = {
      TableName: this.collection,
      IndexName: "dummy-timestamp-index",
      KeyConditionExpression: "dummy = :dummyVal",
      ExpressionAttributeValues: {
        ":dummyVal": "record",
      },
      Limit: limit,
      ScanIndexForward: true,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    try {
      const command = new QueryCommand(params);
      const result = await dynamoDB.send(command);
      return {
        items: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey || undefined,
      };
    } catch (error) {
      throw new Error(
        `No se pudo obtener el historial: ${(error as Error).message}`,
      );
    }
  }
}
