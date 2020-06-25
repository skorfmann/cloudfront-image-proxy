#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CloudfrontImageProxyStack } from '../lib/cloudfront-image-proxy-stack';

const app = new cdk.App();
// only valid option for lambda@edge is us-east-1
new CloudfrontImageProxyStack(app, 'CloudfrontImageProxyStack', { env: { region: 'us-east-1'}});
