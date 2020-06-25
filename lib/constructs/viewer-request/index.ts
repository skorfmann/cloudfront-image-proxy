
import * as cdk from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import { LambdaAtEdge, LambdaAtEdgeHandler } from '../lambda-at-edge'
import * as path from 'path'

export class ViewerRequest extends cdk.Construct implements LambdaAtEdgeHandler {
  public readonly lambdaAtEdge: LambdaAtEdge

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.lambdaAtEdge = new LambdaAtEdge(this, 'LambdaAtEdge', {
      eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
      handlerPath: path.join(__dirname, "lambda"),
      memorySize: 128,
      // max 5 seconds
      timeout: cdk.Duration.seconds(1),
    })
  }
}