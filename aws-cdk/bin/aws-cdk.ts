#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { PuppeteerStack } from "../lib/aws-cdk-stack";

const app = new cdk.App();
new PuppeteerStack(app, "PuppeteerStack", {
  environmentVariables: {
    IS_LOCAL: "false",
    BUCKET_NAME: "hello",
  },
});
