'use strict'

const t = require('tap')

const { CloudWatchLogs } = require('@aws-sdk/client-cloudwatch-logs')
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { SQSClient } = require('@aws-sdk/client-sqs')
const { mockClient } = require('aws-sdk-client-mock')

const dynamoClientMock = mockClient(DynamoDBClient)
const cloudwatchClientMock = mockClient(CloudWatchLogs)
const sqsClientMock = mockClient(SQSClient)

const lambda = require('../src/index').handler
const config = require('../src/config')

t.test('the lambda function should run', async t => {
  const start = '2022-06-08T00:00:00.000Z'
  const end = '2022-06-09T00:00:00.000Z'
  const logs = [
    [{ value: JSON.stringify({ car: 'car1' }) }],
    [{ value: JSON.stringify({ car: 'car2' }) }]
  ]

  sqsClientMock.resolves({})
  dynamoClientMock.resolves({})

  cloudwatchClientMock
    .onAnyCommand({
      startTime: Math.floor(new Date(start).getTime() / 1_000),
      endTime: Math.floor(new Date(end).getTime() / 1_000),
      logGroupName: config.CLOUDWATCH_LOG_GROUP,
      queryString: 'fields @message\n| filter @message like /"level":50/\n| limit 10000'
    })
    .resolves({ queryId: 'queryId' })

  cloudwatchClientMock
    .onAnyCommand({ queryId: 'queryId' })
    .resolves({ status: 'Complete', results: logs })

  t.equal(await lambda({ start, end }), undefined)
})
