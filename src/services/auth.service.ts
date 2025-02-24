import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { randomUUID } from "crypto";

import { TokenResponse, User } from "../interfaces/merged.types";
import { config } from "../config/config";

export class AuthService {
  async getUserForLogin(email: string): Promise<User> {
    const user: User = {
      id: randomUUID(),
      email,
    };
    return user;
  }

  signToken(user: User): TokenResponse {
    const secret = config.jwtSecret as Secret;
    const jwtConfig: SignOptions = {
      expiresIn: "3d",
    };
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, jwtConfig);

    return { token };
  }
}
