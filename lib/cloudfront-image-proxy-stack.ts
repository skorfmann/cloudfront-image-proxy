
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import { OriginResponse } from './constructs/origin-response'
import { ViewerRequest } from './constructs/viewer-request'
import { ImageProxy } from './constructs/image-proxy'

export class CloudfrontImageProxyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const imageStore = new s3.Bucket(this, "ImageStore");

    const originResponse = new OriginResponse(this, 'OriginResponse')
    imageStore.grantReadWrite(originResponse.lambdaAtEdge.handler)

    new ImageProxy(this, 'ImageProxy', {
      imageStore,
      lambdaAssociations: [
        originResponse,
        new ViewerRequest(this, 'ViewerRequest'),
      ]
    })
  }
}
