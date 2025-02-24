import crypto from "crypto";
import jwt from "jsonwebtoken";

import { AuthService } from "../../src/services/auth.service";
import { config } from "../../src/config/config";
import { User, TokenResponse } from "../../src/interfaces/merged.types";

describe("Pruebas de AuthService", () => {
  let authService: AuthService;
  const fixedUUID = "8bcc3a50-1cdc-4e27-b87d-5737917a4f0b";
  const testEmail = "test@email.com";

  beforeEach(() => {
    authService = new AuthService();
    jest.spyOn(crypto, "randomUUID").mockReturnValue(fixedUUID);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Prueba de getUserForLogin", () => {
    it("Debe retornar un usuario con id y email proporcionado", async () => {
      const user: User = await authService.getUserForLogin(testEmail);
      expect(user).toEqual({ id: fixedUUID, email: testEmail });
    });
  });

  describe("Prueba de signToken", () => {
    it("Debe retornar un objeto TokenResponse con un token firmado", () => {
      const user: User = { id: fixedUUID, email: testEmail };

      const fakeToken = "fake-jwt-token";
      const jwtSignSpy = jest
        .spyOn(jwt, "sign")
        .mockImplementation(() => fakeToken);

      const result: TokenResponse = authService.signToken(user);

      expect(jwtSignSpy).toHaveBeenCalledWith(
        { sub: fixedUUID, email: testEmail },
        config.jwtSecret,
        { expiresIn: "3d" },
      );

      expect(result).toEqual({ token: fakeToken });
    });

    it("Debe propagar error si jwt.sign lanza una excepción", () => {
      const user: User = { id: fixedUUID, email: testEmail };
      const errorMsg = "JWT signing error";
      jest.spyOn(jwt, "sign").mockImplementation(() => {
        throw new Error(errorMsg);
      });

      expect(() => authService.signToken(user)).toThrow(errorMsg);
    });
  });
});
