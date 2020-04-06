const Hapi = require('@hapi/hapi');
const Pino = require('hapi-pino');
const Inert = require('@hapi/inert');
const Vision = require('vision');
const Swagger = require('hapi-swagger');

const Pack = require('./package');
const Api = require('./lib');

const server = Hapi.server({
  port: process.env.API_PORT || 8001,
  routes: {
    validate: {
      failAction: async (request, h, err) => {
        console.error(err); throw err;
      }
    }
  }
})

const swaggerOptions = {
  "documentationPath": "/documentation",
  "jsonPath": "/swagger.json",
  "swaggerUIPath": "/swaggerui/",
  "host": "127.0.0.1:8001",
  "info": {
    "title": "Cracker - Issues Tracker API",
    "version": Pack.version,
    "description": "API for the Cracker - Issues Tracker"
  }
};

(async () => {
  await Api.initialize(server, {});

  await server.register({
    plugin: Pino,
    options: {
      redact: ['req.headers', 'res.headers']
    }
  });

  await server.register([
    Inert,
    Vision,
    {
      plugin: Swagger,
      options: swaggerOptions
    }
  ])

  try {
    await server.start();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();

