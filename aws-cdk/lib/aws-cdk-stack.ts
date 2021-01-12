import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as target from "@aws-cdk/aws-elasticloadbalancingv2-targets";

export class PuppeteerStack extends cdk.Stack {
  constructor(
    scope: cdk.App,
    id: string,
    props: {
      environmentVariables?: any;
    } & cdk.StackProps
  ) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "PuppeteerVpcStack", {
      maxAzs: 2,
      natGateways: 0,
      cidr: "192.168.0.0/16",
      subnetConfiguration: [
        { subnetType: ec2.SubnetType.PUBLIC, name: "Public" },
      ],
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, "PuppeteerAlbStack", {
      vpc: vpc,
      internetFacing: true,
    });

    const albListener = alb.addListener("HttpListener", {
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 80,
      defaultAction: elbv2.ListenerAction.fixedResponse(404, {
        contentType: elbv2.ContentType.TEXT_PLAIN,
        messageBody: "",
      }),
    });

    const lambdaFn = new lambda.Function(this, "PuppeteerStack", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../server/puppeteer/lib/prod"),
      handler: "index.handler",
      memorySize: 1600,
      timeout: cdk.Duration.seconds(45),
      environment: props.environmentVariables,
      // TODO: add chromium layers to this function to make the deployment faster
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          this,
          "ChromiumLayer",
          "arn:aws:lambda:us-east-1:764866452798:layer:chrome-aws-lambda:22"
        ),
      ],
    });

    new elbv2.ApplicationListenerRule(this, "PuppeteerAlbRule", {
      targetGroups: [
        new elbv2.ApplicationTargetGroup(this, "PuppeteerAlbGroup", {
          targets: [new target.LambdaTarget(lambdaFn)],
          vpc: vpc,
        }),
      ],
      listener: albListener,
      priority: 10,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(["/fly/test", "/fly/bird"]),
      ],
    });
  }
}
