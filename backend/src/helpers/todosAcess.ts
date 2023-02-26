import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
// import { getUserId } from '../lambda/utils';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')
    
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(item: TodoItem): Promise<TodoItem> {
    logger.info("creating a todoItem: ", item)
    await this.docClient.put({
      TableName: this.todosTable,
      Item: item
    }).promise()

    return item
  }

  async updateTodo(updates: TodoUpdate, todoId: String, userId: string): Promise<TodoUpdate> {
    logger.info("updating a todo item with id: ", todoId)
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {'todoId' : todoId, 'userId': userId},
      UpdateExpression: "set #todoname = :n, dueDate = :dd, done = :d",
      ExpressionAttributeValues: {
        ":n": updates.name,
        ":dd": updates.dueDate,
        ":d": updates.done
      },
      ExpressionAttributeNames: {
        "#todoname": "name"
      }

    }).promise()

    return updates
  }

  async deleteTodo(todoId: string, userId: string): Promise<void>{
    logger.info(`deleting todo item with id: ${todoId}`)
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {'todoId': todoId, 'userId': userId}
    }).promise()

  }

  public async setAttachmentUrl(todoId: string, attachmentUrl: string, userId: string): Promise<void> {
    this.docClient
        .update({
            TableName: this.todosTable,
            Key: {
                'todoId': todoId, 'userId': userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl,
            },
            ReturnValues: 'UPDATED_NEW',
        })
        .promise();
      }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}