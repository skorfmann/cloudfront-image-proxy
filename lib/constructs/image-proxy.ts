
import * as cdk from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as s3 from '@aws-cdk/aws-s3'
import { LambdaAtEdgeHandler } from './lambda-at-edge'

interface ImageProxyProps {
  imageStore: s3.Bucket;
  lambdaAssociations: LambdaAtEdgeHandler[];
}

export class ImageProxy extends cdk.Construct {
  public readonly distribution: cloudfront.CloudFrontWebDistribution

  constructor(scope: cdk.Construct, id: string, props: ImageProxyProps) {
    super(scope, id);

    const { imageStore, lambdaAssociations } = props;

    // Origin access identity for cloudfront to access the bucket
    const identity = new cloudfront.OriginAccessIdentity(this, "Identity");
    imageStore.grantRead(identity);

    // The CDN web distribution
    this.distribution = new cloudfront.CloudFrontWebDistribution(this, "Distribution", {
      loggingConfig: {},
      originConfigs: [
        {
          originHeaders: {
            // due to lack of ENV support in Lambda@edge, pass it as a header
            BUCKET_NAME: imageStore.bucketName
          },
          s3OriginSource: {
            s3BucketSource: imageStore,
            originAccessIdentity: identity,
          },
          behaviors: [
            {
              defaultTtl: cdk.Duration.minutes(60),
              minTtl: cdk.Duration.minutes(60),
              maxTtl: cdk.Duration.days(365),
              forwardedValues: {
                queryString: true,
                queryStringCacheKeys: ['d']
              },
              isDefaultBehavior: true,
              lambdaFunctionAssociations: lambdaAssociations.map(association => (association.lambdaAtEdge.association))
            }
          ]
        }
      ],
    });

    new cdk.CfnOutput(this, 'ImageProxyUrl', {
      value: this.distribution.domainName
    })
  }
}

