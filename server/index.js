const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const proxy = require('koa-proxy')

const app = new Koa()
const router = new Router()
const { TOKEN } = process.env
const targetTxtPath = path.join(__dirname, './target.txt')

if (!TOKEN) {
  throw new Error('TOKEN env must be provided')
}

router.post('/set-target', bodyParser({ enableTypes: ['text'] }), async (ctx) => {
  const authorization = ctx.request.get('Authorization')

  if (authorization === TOKEN) {
    await fs.promises.writeFile(targetTxtPath, ctx.request.body)

    ctx.body = 'Ok'
  } else {
    ctx.status = 401
    ctx.body = 'Unauthorized'
  }
})

let proxyMiddleware, proxyTarget

router.all('*', async (ctx, next) => {
  const target = await fs.promises.readFile(targetTxtPath, { encoding: 'UTF-8' })

  if (!target) {
    throw new Error('target.txt empty')
  }

  // Basic memoization
  if (target !== proxyTarget) {
    proxyTarget = target
    proxyMiddleware = proxy({ host: target })
  }

  await proxyMiddleware(ctx, next)
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(80, () => {
  console.log('Listening on port 80')
})

// Make CTRL+C work in Docker container
process.on('SIGINT', () => process.exit(1))
