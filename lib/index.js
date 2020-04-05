const Package = require('../package.json')

const routes = [
  {
    method: 'GET',
    path: '/version',
    config: {
      handler: () => { return { version: Package.version }},
      description: 'Return version of the API. Can be used as a healthcheck.'
    }
  }
];

exports.initialize = async (server, options) => {
  await server.route(routes);
}