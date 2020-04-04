const fetch = require('node-fetch')
const { CronJob } = require('cron')

const {
  GET_IP_ENDPOINT = 'https://ipv4bot.whatismyipaddress.com/',
  SET_TGT_ENDPOINT,
  SET_TGT_TOKEN,
  TGT_PRTCL = 'http:',
  TGT_PORT = '32400',
  TZ = null
} = process.env

if (!SET_TGT_ENDPOINT) {
  throw new Error('SET_TGT_ENDPOINT env var must be set')
}

if (!SET_TGT_TOKEN) {
  throw new Error('SET_TGT_TOKEN env var must be set')
}

async function handleTick () {
  try {
    console.log(`${Date.now()}: tick.`)

    const ip = await fetch(GET_IP_ENDPOINT).then(res => res.text())

    await fetch(SET_TGT_ENDPOINT, {
      method: 'POST',
      body: `${TGT_PRTCL}//${ip}:${TGT_PORT}`,
      headers: {
        Authorization: SET_TGT_TOKEN,
        'Content-Type': 'text/plain'
      }
    })
  } catch (error) {
    console.error('error', error)
  }
}

new CronJob('* * * * *', handleTick, null, true, TZ, null, true)

console.log('Started.')
