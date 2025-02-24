import Joi from "joi";

export const validateCharacterId = Joi.object({
  characterId: Joi.number().integer().required(),
});

export const validateCharacter = Joi.object({
  name: Joi.string().required(),
  height: Joi.number().integer().required(),
  mass: Joi.number().integer().required(),
  hair_color: Joi.string(),
  skin_color: Joi.string(),
  eye_color: Joi.string(),
  birth_year: Joi.string(),
  gender: Joi.string().valid("male", "female", "unknown", "n/a").required(),
  homeworld: Joi.string().uri(),
  url: Joi.string().uri(),
  matching_pokemon: Joi.object({
    name: Joi.string().required(),
    height: Joi.number().integer().required(),
    weight: Joi.number().integer().required(),
    type: Joi.string().required(),
  }),
});

export const validateHistoryPagination = Joi.object({
  lastEvaluatedKey: Joi.string().custom((value, helpers) => {
    try {
      const parsed = JSON.parse(value);
      const subSchema = Joi.object({
        id: Joi.string().uuid().required(),
        dummy: Joi.string().required(),
        timestamp: Joi.number().integer().required(),
      });

      const { error } = subSchema.validate(parsed);
      if (error) return helpers.error("any.invalid");

      return parsed;
    } catch (err) {
      return helpers.error(`any.invalid: ${err}`);
    }
  }),

  limit: Joi.number().integer().min(1).max(100),
});
