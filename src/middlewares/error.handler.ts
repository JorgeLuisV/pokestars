import { Request, Response, NextFunction } from "express";
import { Boom } from "@hapi/boom";

export function logErrors(
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(err);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
}

export function boomErrorHandler(
  err: Boom | Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof Boom && err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err);
  }
}
