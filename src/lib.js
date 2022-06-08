'use strict'

const sleep = require('util').promisify(setTimeout)
const { DeleteItemCommand } = require('@aws-sdk/client-dynamodb')
const { marshall } = require('@aws-sdk/util-dynamodb')
const { SendMessageCommand } = require('@aws-sdk/client-sqs')

const CLOUDWATCH_QUERY = `fields @message
| filter @message like /"level":50/
| limit 10000` // max is 10k

async function retrieveLogs({ start, end, group, ping, client, logger }) {
  logger.info({ start: start.toISOString(), end: end.toISOString(), group }, 'CloudWatch retrieving logs')

  const query = await client.startQuery({
    startTime: Math.floor(start.getTime() / 1_000),
    endTime: Math.floor(end.getTime() / 1_000),
    logGroupName: group,
    queryString: CLOUDWATCH_QUERY
  })

  let status, result
  do {
    await sleep(ping)
    result = await client.getQueryResults({ queryId: query.queryId })
    status = result.status
  } while (status === 'Running' || status === 'Scheduled')

  if (status !== 'Complete') {
    throw new Error(`CloudWatch Query ${query.queryId} failed with status ${status}`)
  }

  logger.info(`CloudWatch got ${result.results.length} log entries`)

  return result.results
}

function analizeLogs(logs) {
  const cars = new Set()
  for (const log of logs) {
    try {
      const car = JSON.parse(log[0].value).car
      car && cars.add(car)
    } catch (err) {
    }
  }
  return [...cars]
}

async function removeFromTable({ car, table, key, client, logger }) {
  logger.info({ car, table, key }, 'Remove car record on table')

  await client.send(
    new DeleteItemCommand({
      TableName: table,
      Key: marshall({ [key]: car }, { removeUndefinedValues: true })
    })
  )
}

async function pushToQueue({ car, queue, client, logger }) {
  logger.info({ car }, 'Push car to queue')

  await client.send(
    new SendMessageCommand({
      MessageBody: JSON.stringify({ Records: [{ body: car }] }),
      QueueUrl: queue
    })
  )
}

function validate(event) {
  const start = new Date(event.start)
  const end = new Date(event.end)

  return { start, end }
}

module.exports = {
  retrieveLogs,
  analizeLogs,
  removeFromTable,
  pushToQueue,
  validate
}
