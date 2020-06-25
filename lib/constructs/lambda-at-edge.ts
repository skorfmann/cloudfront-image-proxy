import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as iam from '@aws-cdk/aws-iam'

export interface LambdaAtEdgeProps {
  eventType: cloudfront.LambdaEdgeEventType;
  handlerPath: string;
  memorySize?: number;
  timeout?: cdk.Duration;
}

export interface LambdaAtEdgeHandler {
  readonly lambdaAtEdge: LambdaAtEdge;
}

export class LambdaAtEdge extends cdk.Construct {
  public readonly association: cloudfront.LambdaFunctionAssociation
  public readonly handler: lambda.Function

  constructor(scope: cdk.Construct, id: string, props: LambdaAtEdgeProps) {
    super(scope, id);

    const { handlerPath, eventType, memorySize, timeout } = props;
    const runtime = lambda.Runtime.NODEJS_12_X

    this.handler = new lambda.Function(this, 'Handler', {
      code: lambda.Code.fromAsset(handlerPath, {
        bundling: {
          image: runtime.bundlingDockerImage,
          command: [
            'bash', '-c', [
              `cp -R /asset-input/* /asset-output/`,
              `cd /asset-output`,
              `npm install`
            ].join(' && ')
          ],
          user: 'root'
        },
      }),
      runtime,
      handler: "index.handler",
      memorySize: memorySize || 128,
      timeout: timeout || cdk.Duration.seconds(5),
      role: new iam.Role(this, 'AllowLambdaServiceToAssumeRole', {
        assumedBy: new iam.CompositePrincipal(
          new iam.ServicePrincipal('lambda.amazonaws.com'),
          new iam.ServicePrincipal('edgelambda.amazonaws.com'),
        ),
        managedPolicies: [iam.ManagedPolicy.fromManagedPolicyArn(this, 'Execution', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole')]
      })
    });

    const hash = cdk.FileSystem.fingerprint(handlerPath, {
      exclude: ['node_modules']
    })

    const version = this.handler.addVersion(hash);

    this.association = {
      eventType,
      lambdaFunction: version
    }
  }
}