# [BETA] koa-gerJs
Use gerJs library plus use the models to validate and reformat the input/ouput payload in the API.

Example : [https://github.com/dobobaie/example-koa-gerjs-server](https://github.com/dobobaie/example-koa-gerjs-server)  

Help us to improve the project by contributing 👥  

## ☁️ Installation

```
$ npm install gerjs-koa
```

## 📝 Usage

Use [gerjs-core](https://github.com/dobobaie/gerjs) documentation to create `modelsAPI` file. 

### Initialization

Create a new instance :
  
Then create the models. [`Joi`](https://hapi.dev/family/joi/) is required.  

``` js
const modelsAPI = require("./models/models");
const gerJs = require("gerjs-koa")({
  // same gerjs-core options | except `destinationPath` is not available
  exportTo: 'path/doc', // string ; optional
})(modelsAPI);
```

## ⚙️ GerJs initialization in Koa side

``` js
const Koa = require("koa");
const router = require("koa-router");

const app = new Koa();

// please use all the middlewares before
app.use(gerJs.middleware(router)); // middleware to validate payload and reformat reponse | required

app.use(
	router
	  // routes...
	  .get("/swagger", gerJs.expose()) // expose the swagger documentation | optional
	  .get("*", ctx => ctx.throw(boom.notFound()))
	  .routes()
	);

```

## 👥 Contributing

Please help us to improve the project by contributing :)  

## ❓️ Testing

Clone the repo and run from the project root:

```
$ npm install
$ npm test
```
