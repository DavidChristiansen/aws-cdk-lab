#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');
import fluentCDK = require('fluent.aws-cdk');
import { VPCs, VPCProps } from '../constructs/vpc';
import { VPN, VPNProps } from '../constructs/vpn';
import { TransitGW, TransitGWProps } from '../constructs/transitgw';

const app = new cdk.App();
new fluentCDK.MasterBuilder(app, 'lab')
    .withCiCd('infraCICD', 'cdk-lab')
    .addStack('vpc', s => {
        s.addConstruct<VPCs, VPCProps>(VPCs, 'management', {
            cidr: '10.121.0.0/16',
            includePublicSubnet: true,
            includePrivate: true,
            includeIsolated: false
        });
    })
    .addStack('vpn', s => {
        s.addConstruct<VPN, VPNProps>(VPN, 'VPN', {
            vpcID: 'management',
            customerGatewayIpAddress: app.node.getContext('CustomerGatewayIP')
        }, construct => {
            construct.addTag("Purpose", "Customer VPN")
        });
    })
    .addStack('transitGW', s => {
        s.addConstruct<TransitGW, TransitGWProps>(TransitGW, 'transitGW', {
            vpcID: 'management',
        });
    });
app.run();
