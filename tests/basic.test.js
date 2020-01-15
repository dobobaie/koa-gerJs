process.env.gerjsKoaRequire = __dirname + "/../lib";
process.env.NODE_ENV = "development";
process.env.SERVER_IP = "localhost";
process.env.SERVER_PORT = 5050;
process.env.LOCALE = "en";
process.env.AUTH_TOKEN = "0123456789abc";

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

const swagger_yml_content_file = fs.readFileSync(__dirname + '/../swagger/swagger.yml').toString();
const swagger_yml_content_file_example = fs.readFileSync(__dirname + '/swagger.example.yml').toString();
test("[File] - Swagger file", t =>
  t.is(swagger_yml_content_file, swagger_yml_content_file_example, "difference in file")
);

const swagger_content_file = fs.readFileSync(__dirname + '/../swagger/index.html').toString();
test("[Request] - Swagger route", t =>
  request.get(server_url + '/swagger')
  .then(r =>
    t.is(r, swagger_content_file, "return a wrong response")
  )
  .catch(r => t.fail(r))
);

test("[Request] - Defaut route", t =>
  request.get(server_url + '/')
  .then(r =>
    t.is(r, "Default reponse", "return a wrong response")
  )
  .catch(r => t.fail(r))
);

test("[Request] - Retrieve users without token", t =>
  request.get(server_url + '/users')
  .then(r =>
    t.fail("request is not supposed to work")
  )
  .catch(r =>
    t.deepEqual(r.error, {
      errors: [
        { code: 'validation_error_token_is_required' }
      ]
    }, "return a wrong error")
  )
);

test("[Request] - Retrieve users with a wrong token", t =>
  request.get(server_url + '/users' + `?token=123`)
  .then(r =>
    t.fail("request is not supposed to work")
  )
  .catch(r =>
    t.deepEqual(r.error, {
      errors: [
        { code: 'validation_error_token_length_must_be_at_least_12_characters_long' }
      ]
    }, "return a wrong error")
  )
);

test("[Request] - Retrieve users with a right token", t =>
  request.get(server_url + '/users' + `?token=${process.env.AUTH_TOKEN}`)
  .then(r =>
    t.deepEqual(
      r,
      [{
        firstname: "Jean", 
        lastname: "Bernard",
        test2: [{
          token: "0123456789abc"
        }],
        test: {
          message: "request done with success",
          result: true
        }
      }],
      "return a wrong response"
    )
  )
  .catch(r => t.fail(r))
);

test("[Request] - Create user without data", t =>
  request.post(server_url + '/users')
  .then(r =>
    t.fail("request is not supposed to work")
  )
  .catch(r =>
    t.deepEqual(r.error, {
      errors: [
        { code: 'validation_error_post_users_must_be_an_array' }
      ]
    }, "return a wrong error")
  )
);

test("[Request] - Create user with wrong age", t =>
  request.post(server_url + '/users', {
    body: [{
      firstname: "Jean", 
      lastname: "Bernard",
      age: "abc"
    }]
  })
  .then(r =>
    t.fail("request is not supposed to work")
  )
  .catch(r =>
    t.deepEqual(r.error, {
      errors: [
        { code: 'validation_error_0_age_must_be_a_number' }
      ]
    }, "return a wrong error")
  )
);

test("[Request] - Create user with good data", t =>
  request.post(server_url + '/users', {
    body: [{
      firstname: "Jean", 
      lastname: "Bernard",
      age: 35
    }]
  })
  .then(r =>
    t.deepEqual(r, {
      message: 'request done with success',
      result: true
    }, "return a wrong response")
  )
  .catch(r => t.fail(r))
);
