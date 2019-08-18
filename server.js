const Koa = require('koa')
const logger = require('koa-logger')
const path = require('path')
const serve = require('koa-static')
const historyApiFallback = require('koa2-history-api-fallback')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const json = require('koa-json')

const routes = require('./server/routes')
require('dotenv').config()

const app = new Koa()
const router = Router()

const port = process.env.SERVER_PORT

app.use(bodyParser())
app.use(json())
app.use(logger())

app.use(async function (ctx, next) {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log('%s %s - %s', ctx.method, ctx.url, ms)
})

app.use(async function (ctx, next) {
  try {
    await next()
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401
      ctx.body = {
        message: 'Protected resource, use Authorization header to get access',
      }
    } else {
      throw err
    }
  }
})

app.on('error', function (err, ctx) {
  console.log('server error', err)
})

router.use('/api', routes.routes())

app.use(router.routes())
app.use(historyApiFallback())
app.use(serve(path.resolve('dist')))

app.listen(port, () => {
  console.log(`Server is listening on ${port}`)
})