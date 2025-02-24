import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";

export type User = {
  id: string;
  email: string;
};

export type TokenResponse = {
  token: string;
};

export type CreateCharacter = {
  name: string;
  height: string;
  mass: string;
  hair_color?: string;
  skin_color?: string;
  eye_color?: string;
  birth_year?: string;
  gender: string;
  homeworld?: string;
  url?: string;
  dummy?: string;
  matching_pokemon?: Pokemon | string;
};

export interface Character extends CreateCharacter {
  id: string;
  timestamp: number;
}

export interface GetRecordsResponse {
  items: Record<string, Character>[];
  lastEvaluatedKey?: QueryCommandInput["ExclusiveStartKey"];
}

export type Pokemon = {
  name: string;
  height: number;
  weight: number;
  type: string;
};

export interface PokemonColorResponse {
  pokemon_species: { name: string; url: string }[];
}

export interface PokemonType {
  type: {
    name: string;
  };
}
