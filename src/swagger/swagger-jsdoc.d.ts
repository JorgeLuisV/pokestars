declare module "swagger-jsdoc" {
  export interface Options {
    definition: object;
    apis: string[];
  }
  function swaggerJsdoc(options: Options): object;
  export default swaggerJsdoc;
}
