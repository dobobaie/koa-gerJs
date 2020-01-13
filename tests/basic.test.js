process.env.gerjsKoaRequire = __dirname + "/../lib";
process.env.NODE_ENV = "development";
process.env.SERVER_IP = "localhost";
process.env.SERVER_PORT = 5050;
process.env.LOCALE = "en";
process.env.AUTH_TOKEN = "abc";

const fs = require('fs');
const test = require('ava');
const request = require('ava-http');
const gerjsTestKoa = require('gerjs-test-koa');

const server_url = `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}`;

test("Server initialization", t =>
  new Promise((resolve, reject) =>
    gerjsTestKoa.modules.server.listen(
      gerjsTestKoa.app.config.server_port,
      () => resolve(
        `Server listening at ${gerjsTestKoa.app.config.server_port}`
      )
    )
  )
  .then(m => t.pass(m))
  .catch(m => t.fail(m))
);

const swagger_content_file = fs.readFileSync(__dirname + '/../swagger/index.html').toString();
test("[Request] - Swagger route '/swagger'", t =>
  request.get(server_url + '/swagger')
  .then(r =>
    t.is(r, swagger_content_file, "return a wrong response")
  )
  .catch(r => t.fail(r))
);

test("[Request] - Defaut route '/'", t =>
  request.get(server_url + '/')
  .then(r =>
    t.is(r, "Default reponse", "return a wrong response")
  )
  .catch(r => t.fail(r))
);
