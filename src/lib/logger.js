import pino from 'pino'
import fs from 'fs'

fs.mkdirSync('./logs', { recursive: true }) // create logs folder if it doesn't exist

const streams = [
  { stream: process.stdout },
  { stream: pino.destination('./logs/app.log') }
]

const logger = pino({ level: 'info' }, pino.multistream(streams))

export default logger