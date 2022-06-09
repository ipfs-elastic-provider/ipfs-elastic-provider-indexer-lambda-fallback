# IPFS Elastic Provider - Indexer Fallack

The lambda does:

- get errors from Cloudwatch, from `start` to `end`
- get failing cars from errors (all logs have the related car file)
- remove from cars table (not the definitive solution, in the current state is the best option)
- push car to indexer queue

## Event

event to invoke the lambda

```js
{
  start: "2022-06-08T00:00:00.000Z", // ISO time string
  end: "2022-06-09T00:00:00.000Z" // ISO time string
}
```

## Environment variables

| Name                  | Default                | Description                                    |
| --------------------- | ---------------------- | ---------------------------------------------- |
| AWS_ACCESS_KEY_ID     |                        | The AWS key ID.                                |
| AWS_REGION            |                        | The AWS region.                                |
| AWS_SECRET_ACCESS_KEY |                        | The AWS access key.                            |
| LOG_LEVEL             | `info`                 |                                                |
| DYNAMO_CAR_TABLE      | `cars`                 |                                                |
| DYNAMO_CAR_KEY        | `path`                 |                                                |
| SQS_QUEUE             | `indexer-topic`        |                                                |
| CLOUDWATCH_LOG_GROUP  | `/aws/lambda/indexer`  |                                                |
| CLOUDWATCH_PING       | 100                    | ms                                             |
