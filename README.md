# TODO Name

The lambda (TODO name) does:

- get errors from cloudwatch
- get failing cars from errors (all logs have the event car file)
- remove from cars table (now it's the best option)
- push car to indexer queue

## Environment variables

| Name                  | Default       | Description                                    |
| --------------------- | ------------- | ---------------------------------------------- |
| AWS_ACCESS_KEY_ID     |               | The AWS key ID.                                |
| AWS_REGION            |               | The AWS region.                                |
| AWS_SECRET_ACCESS_KEY |               | The AWS access key.                            |
| LOG_LEVEL             | `info`        |                                                |
