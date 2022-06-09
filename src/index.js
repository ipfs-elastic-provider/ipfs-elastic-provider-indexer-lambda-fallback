'use strict'

const { CloudWatchLogs } = require('@aws-sdk/client-cloudwatch-logs')
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { SQSClient } = require('@aws-sdk/client-sqs')

const { validate, retrieveLogs, analizeLogs, removeFromTable, pushToQueue } = require('./lib')
const { logger } = require('./logging')
const { CLOUDWATCH_PING, CLOUDWATCH_LOG_GROUP, DYNAMO_CAR_TABLE, DYNAMO_CAR_KEY, SQS_QUEUE } = require('./config')

async function main(event) {
  logger.info('start')

  const cloudwatchClient = new CloudWatchLogs(process.env.DEBUG && event.credentials)
  const dynamoClient = new DynamoDBClient(process.env.DEBUG && event.credentials)
  const sqsClient = new SQSClient(process.env.DEBUG && event.credentials)

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

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i]
    try {
      logger.info({ car }, `Fixing car ${i + 1} / ${cars.length}`)
      await removeFromTable({
        car,
        table: DYNAMO_CAR_TABLE,
        key: DYNAMO_CAR_KEY,
        client: dynamoClient,
        logger
      })
      await pushToQueue({
        car,
        queue: SQS_QUEUE,
        client: sqsClient,
        logger
      })
    } catch (err) {
      logger.error({ err, car }, 'Error fixing car')
    }
  }

  logger.info('done')
}

exports.handler = main
