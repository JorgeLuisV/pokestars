import { Strategy, ExtractJwt } from "passport-jwt";
import { config } from "../../config/config";

const jwtSecret = config.jwtSecret;

if (!jwtSecret) {
  throw new Error("JWT secret is not configured");
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

const JwtStrategy = new Strategy(options, (payload, done) => {
  return done(null, payload);
});

export default JwtStrategy;
