'use strict'

const { CloudWatchLogs } = require('@aws-sdk/client-cloudwatch-logs')
const { Agent } = require('https')
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler')
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { SQSClient } = require('@aws-sdk/client-sqs')

const { validate, retrieveLogs, analizeLogs, removeFromTable, pushToQueue } = require('./lib')
const { logger } = require('./logging')
const { CLOUDWATCH_PING, CLOUDWATCH_LOG_GROUP, DYNAMO_CAR_TABLE, DYNAMO_CAR_KEY, SQS_QUEUE } = require('./config')

const cloudwatchClient = new CloudWatchLogs()
const dynamoClient = new DynamoDBClient({
  requestHandler: new NodeHttpHandler({ httpsAgent: new Agent({ keepAlive: true, keepAliveMsecs: 60000 }) })
})
const sqsClient = new SQSClient()

async function main(event) {
  logger.info('start')

  let start, end
  try {
    const args = validate(event)
    start = args.start
    end = args.end
  } catch (err) {
    logger.error({ err, event }, 'Invalid event')
    return
  }

  const logs = await retrieveLogs({
    start,
    end,
    group: CLOUDWATCH_LOG_GROUP,
    ping: CLOUDWATCH_PING,
    client: cloudwatchClient,
    logger
  })
  const cars = analizeLogs(logs)
  for (const car of cars) {
    try {
      await removeFromTable({
        car,
        table: DYNAMO_CAR_TABLE,
        key: DYNAMO_CAR_KEY,
        client: dynamoClient
      })
      await pushToQueue({
        car,
        queue: SQS_QUEUE,
        client: sqsClient
      })
    } catch (err) {
      logger.error({ err, car }, 'Error')
    }
  }

  logger.info('done')
}

exports.handler = main
