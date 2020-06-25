
import * as cdk from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import { LambdaAtEdge, LambdaAtEdgeHandler } from '../lambda-at-edge'
import * as path from 'path'

export class OriginResponse extends cdk.Construct implements LambdaAtEdgeHandler {
  public readonly lambdaAtEdge: LambdaAtEdge

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.lambdaAtEdge = new LambdaAtEdge(this, 'LambdaAtEdge', {
      eventType: cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE,
      handlerPath: path.join(__dirname, "lambda"),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(15)
    })
  }
}