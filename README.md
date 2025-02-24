# 🌌 Pokestars

Pokestars Node.js es un API Restful desarrollada en Node.js con Typescript, Express.js y Serverless en la cual podrás encontrar qué Pokémon le iría mejor a cada personaje de Star Wars.

El proyecto consulta las APIs de [SWAPI](https://swapi.dev/) y [PokeAPI](https://pokeapi.co/) para obtener los datos de los personajes.

## Tecnologías y paquetes utilizados

- Node.js
- Typescript
- Express.js
- Serverless
- DynamoDB
- dotenv
- Joi
- hapi/boom
- JSON Web Token (JWT)
- Passport
- Express rate limit
- Swagger

## Endpoints

### Auth

#### Generar token de acceso:
```bash
  GET /api/auth
```
Genera un token de acceso para utilizar las rutas de Merged.

### Merged
Todos los endpoints de las tareas están protegidas por JWT.

#### Fusionar personajes:

```bash
  GET /api/fusionados/{idCharacter}
```

Fusiona los datos de un personaje de Star Wars con un Pokémon basados en su color, altura y peso más parecidos. Recibe como parámetro el id de un personaje de Star Wars.

#### Crear un personaje:

```bash
  POST /api/almacenar
```

Crea un nuevo personaje con su respectivo Pokémon.

#### Ver historial:

```bash
  GET /api/historial
```

Muestra el historial de personajes que tienen su Pokémon.

## Configuración

- **Variables de Entorno:** La aplicación utiliza dotenv para acceder a las variables de entorno. Asegúrate de configurar correctamente las variables necesarias.

## Instalación

1. Clona este repositorio:
```bash
git clone ...
```

2. Instala las dependencias:
```bash
npm install
```

3. Haz una copia del archivo ``.env.example`` y renómbralo a ``.env``, luego ingresa al archivo y asigna un valor a la variable de entorno.

6. Compila y levanta el proyecto
```bash
npm run dev
```
## Documentation
Puedes encontrar toda la documentación de los endpoints en `URL_BASE/docs`

## Licencia

Este proyecto está bajo la Licencia MIT. Para más detalles, consulta el archivo [LICENSE](LICENSE).