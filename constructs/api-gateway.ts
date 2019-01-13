import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import apigateway = require('@aws-cdk/aws-apigateway');
import lambda = require('@aws-cdk/aws-lambda');
import path = require('path');
import { FluentConstruct, ConstructStore, FluentStackProps } from 'fluent.aws-cdk';

export class APIGatewayProps extends FluentStackProps {
    vpcID: string;
}
export class APIGateway extends FluentConstruct {
    constructor(parent: cdk.Stack, name?: string, props?: APIGatewayProps, constructStore?: ConstructStore) {
        super(parent, name, props, constructStore);
        const vpc = ec2.VpcNetwork.import(this, 'vpc', this.ConstructStore.getSharedConstruct(props.vpcID));

        let getWeatherHandler = new lambda.Function(this, 'weatherForecasts', {
            runtime: lambda.Runtime.NodeJS810,
            vpc,
            handler: 'index.handler',
            code: lambda.Code.directory(path.join(__dirname, '../../lambda-functions/', 'weatherforecasts')),
            tracing: lambda.Tracing.Active
        });

        const api = new apigateway.RestApi(this, 'weather-api');
        api.root.addMethod('ANY');

        const forecasts = api.root.addResource('forecasts');
        const getWeatherIntegration = new apigateway.LambdaIntegration(getWeatherHandler);
        forecasts.addMethod('GET', getWeatherIntegration);

        let data = JSON.stringify({
            APIGatewayURI: api.url
        });
        // fs.writeFileSync('../webapp/src/config.json', data);
    }
}