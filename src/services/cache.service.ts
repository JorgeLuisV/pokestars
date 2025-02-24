import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import dynamoDB from "../libs/dynamodb";
import { Character } from "../interfaces/merged.types";

export class CacheService {
  private static readonly collection = "Cache";
  private static readonly cacheTime = 30 * 60 * 1000;

  static async getCachedCharacter(id: string): Promise<Character | null> {
    try {
      const command = new GetCommand({
        TableName: this.collection,
        Key: { id },
      });
      const result = await dynamoDB.send(command);

      if (!result.Item) return null;

      const { data, timestamp } = result.Item;

      if (Date.now() - timestamp > this.cacheTime) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      throw new Error(
        `Error al obtener personaje del caché: ${(error as Error).message}`,
      );
    }
  }

  static async cacheCharacter(
    id: string,
    characterData: Character,
  ): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.collection,
        Item: {
          id,
          data: JSON.stringify(characterData),
          timestamp: Date.now(),
          expiresAt: Date.now() + this.cacheTime,
        },
      });

      await dynamoDB.send(command);
    } catch (error) {
      throw new Error(`Error al guardar en caché: ${(error as Error).message}`);
    }
  }
}
