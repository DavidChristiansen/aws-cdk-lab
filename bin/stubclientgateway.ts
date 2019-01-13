#!/usr/bin/env node
import cdk = require('@aws-cdk/cdk');
import fluentCDK = require('fluent.aws-cdk');
import { VPCs, VPCProps } from '../constructs/vpc';
import { Ec2, Ec2Props } from '../constructs/singleec2';

const app = new cdk.App();

new fluentCDK.MasterBuilder(app, 'clientgateway')
    .addStack('vpc', s => {
        s.addConstruct<VPCs, VPCProps>(VPCs, 'clientgateway', {
            cidr: '10.177.0.0/16',
            includePublicSubnet: true,
            includePrivate: true,
            includeIsolated: false
        });
    })
    .addStack('host', s => {
        s.addConstruct<Ec2, Ec2Props>(Ec2, 'vpnclientgateway', {
            vpcID: 'clientgateway',
            keyName: 'dc-lab',
            tags: [
                { key: "CreatedFor", value: "Lab" },
                { key: "Name", value: "VPN Client Gateway" }
            ]
        });
    })
app.run();
