import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { config } from "../config/config";

const client = new DynamoDBClient({
  region: config.awsRegion,
});

const dynamoDB = DynamoDBDocumentClient.from(client);

export default dynamoDB;
