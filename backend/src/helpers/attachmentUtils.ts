import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
let options: AWS.S3.Types.ClientConfiguration = {
    signatureVersion: 'v4',
};
export const s3 = new XAWS.S3(options);
