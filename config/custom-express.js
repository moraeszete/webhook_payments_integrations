const Koa = require("koa");
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");

const app = new Koa();

app.use(cors());
app.use(bodyParser());

const router = require("../routes");
const validateToken = require("../functions/validateToken");

app.use(async (ctx, next) => {
  ctx.set(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // ctx.set('Access-Control-Allow-Methods', 'POST')
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Credentials", true);
  await next();
});

app.use(async (ctx, next) => {
  const splitRoute = ctx.path.split("/");
  if (splitRoute[1] !== "static") {
    console.log(ctx.path, "- Rota chamada");
  }

  const tokenHeaders = [
    "asaas-access-token"
  ];
  const headerIsValid = tokenHeaders.find((token) => ctx.headers[token]);
  // const mapping = exceptionRoutes.includes(ctx.path)
  if (headerIsValid) {
    const tokenValue = ctx.headers[headerIsValid];
    const validationResult = await validateToken(tokenValue);
    if (validationResult.error) {
      ctx.status = 401;
      ctx.body = {
        error: true,
        message: "Token de acesso inválido",
      }
      return;
    }
  } else if (!headerIsValid) {
    ctx.status = 401;
    ctx.body = {
      error: true,
      message: "Token de acesso não fornecido",
    }
  }
  
  ctx.body = {}
  if(ctx.request.body.body) {
    ctx.body = ctx.request.body.body 
  } else {
    ctx.body = ctx.request.body 
  }

  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
