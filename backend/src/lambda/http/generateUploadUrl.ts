import 'source-map-support/register'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { s3 } from '../../helpers/attachmentUtils';

const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION);

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const imageId = uuid.v4();
    const userId = getUserId(event)
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    createAttachmentPresignedUrl(todoId,`https://${bucketName}.s3.amazonaws.com/${imageId}`, userId);
    const uploadUrl = getImageUploadUrl(imageId)

    return {
      statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
        body: JSON.stringify({
            uploadUrl,
        }),
    }
  }
)

function getImageUploadUrl(imageId:string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration,
});
}
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
