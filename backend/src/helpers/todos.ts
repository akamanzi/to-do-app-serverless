import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic
const logger = createLogger('Todos')

const todoAccess = new TodosAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  logger.info("get all todos for user ", userId)
  return todoAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  logger.info("creating a new todo item")
  const itemId = uuid.v4()
  // const userId = getUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toDateString(),
    done: false
  })
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string, userId: string
): Promise<TodoUpdate> {
  logger.info("updating item: ", todoId)
  return await todoAccess.updateTodo({
    name: updateTodoRequest.name,
    done: updateTodoRequest.done,
    dueDate: updateTodoRequest.dueDate 
  }, todoId, userId)
}

export async function createAttachmentPresignedUrl(todoId: string, attachmentUrl: string, userId: string): Promise<void> {
  return await todoAccess.setAttachmentUrl(todoId, attachmentUrl, userId)
}

export async function deleteTodo(
  todoId: string, userId: string
) {
  return await todoAccess.deleteTodo(todoId, userId)
}