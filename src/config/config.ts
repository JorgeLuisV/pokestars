import dotenv from "dotenv";

dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
};
