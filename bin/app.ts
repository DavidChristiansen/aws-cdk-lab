#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');
import fluentCDK = require('fluent.aws-cdk');
import '../constructs/CICD';
import { VPCs, VPCProps } from '../constructs/vpc';
import { WebApplicationProps, WebApplication } from '../constructs/webapplication';
import { DatabaseCluster, DatabaseClusterProps } from '../constructs/databaseCluster';
import { APIGateway, APIGatewayProps } from '../constructs/api-gateway';

const app = new cdk.App();

new fluentCDK.MasterBuilder(app, 'app')
    .withCiCd('webappCICD', 'cdk-lab')
    .addStack('vpc', s => {
        s.addConstruct<VPCs, VPCProps>(VPCs, 'app-vpc', {
            cidr: '10.122.0.0/16',
            includePublicSubnet: true,
            includePrivate: true,
            includeIsolated: true
        })
    })
    // .addStack('ProductionVPCPeering', s => {
    //     s.addConstruct<VPCPeering, VPCPeeringProps>(VPCPeering, 'prodPeer', {
    //         fromVpcID: 'management',
    //         toVpcID: 'prod',
    //         fromVPCCIDR: '10.121.0.0/16',
    //         toVPCCIDR: '10.122.0.0/16'
    //     });
    // })
    .addStack('app', s => {
        s.addConstruct<WebApplication, WebApplicationProps>(WebApplication, 'webapp', {
            vpcID: 'app-vpc',
            keyName: 'dc-lab'
        });
    })
    .addStack('db', s => {
        s.addConstruct<DatabaseCluster, DatabaseClusterProps>(DatabaseCluster, 'database', {
            vpcID: 'app-vpc',
            webAppEC2SGName: 'sg_webapp',
            DatabaseName: 'Lab',
            DatabaseUsername: 'dbadmin',
            DatabasePassword: '4tsxHpXEcDs+KUkn',
            DBEngine: 'aurora'
        });
    })
    .addStack('apigateway', s => {
        s.addConstruct<APIGateway, APIGatewayProps>(APIGateway, 'lambda-apigatway', {
            vpcID: 'app-vpc'
        })
    })
app.run();
