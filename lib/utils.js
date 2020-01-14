const fs = require('fs');

const getContentTypeFromExtension = extension => {
  switch (extension)
  {
    case 'yml':
      return 'mime-types/mime-types-data';
    break;
    case 'png':
      return 'image/png';
    break;
    case 'css':
      return 'text/css';
    break;
    case 'js':
      return 'application/javascript';
    break;
    case 'map':
      return 'application/octet-stream';
    break;
    default:
      return '*';
  }
};

const retrieveContentType = (type, metas) => {
  switch (type)
  {
    case 'array':
    case 'object':
      return 'application/json';
    break;
    default:
      const meta = metas.find(meta => meta['Content-Type']);
      return (meta && meta['Content-Type']) || 'text/plain';
  }
}

const exportDirectory = (directory_source, directory_dest) => {
  const listFiles = fs.readdirSync(directory_source)
    .map(file => '/' + file);
  if (!fs.existsSync(directory_dest)) {
    fs.mkdirSync(directory_dest);
  }
  listFiles.map(file =>
    fs.copyFileSync(
      directory_source + '/' + file,
      directory_dest + '/' + file
    )
  );
};

const matchRoute = listRoutes => ({ method, path }) => {
  const croute = (method + path).split('/');
  return listRoutes.map((route, key) => {
    const routes = route.split('/');
    routes[0] = routes[0].toUpperCase();
    return routes[0] === method
      && routes.length === croute.length
      ? routes.map((r, index) =>
          r[0] === ':' || r === croute[index]
            ? key
            : undefined
        ).pop()
      : undefined
  })
  .filter(r => r !== undefined)
  .shift();
};

const superTmpJoiTrix = (body, model, parent) => {
  if (Array.isArray(body)
    && model.type === 'array'
  ) {
    const item_model = model['$_terms']._inclusions.shift();
    return body.map(item =>
      superTmpJoiTrix(item, item_model)
    );
  }
  if ((typeof(body) === 'object' || body === undefined)
    && model.type === 'object'
    && model._flags.presence !== "required"
  ) {
    return model['$_terms'].keys
      .reduce((accumulator, item_model, index) => {
        accumulator[item_model.key] = superTmpJoiTrix(
          accumulator[item_model.key],
          item_model.schema,
          accumulator // RECREATE IT
        );
        return accumulator;
      }, body || {});
  }
  if (!['object', 'array'].includes(model.type)) {
    const rBody = body ? body : model._flags.default;
    return typeof(rBody) === 'function' ? rBody(parent) : rBody;
  }
  return body;
}

const _f = (...args) => args
  .filter(elem => elem !== undefined)
  .shift();

module.exports = ({
  getContentTypeFromExtension,
  retrieveContentType,
  exportDirectory,
  matchRoute,
  superTmpJoiTrix,
  _f
});
