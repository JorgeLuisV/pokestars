import { Request, Response, NextFunction } from "express";
import boom from "@hapi/boom";
import { ObjectSchema } from "joi";

function validatorHandler(
  schema: ObjectSchema,
  property: "body" | "query" | "params",
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      next(boom.badRequest(error));
    } else {
      next();
    }
  };
}

export default validatorHandler;
