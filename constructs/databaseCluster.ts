import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import rds = require('@aws-cdk/aws-rds');
import { FluentConstruct, ConstructStore, FluentStackProps } from 'fluent.aws-cdk';

export class DatabaseClusterProps extends FluentStackProps {
    vpcID: string;
    webAppEC2SGName: string
    DatabaseName: any;
    DatabaseUsername: any;
    DatabasePassword: any;
    DBEngine: any;
}
export class DatabaseCluster extends FluentConstruct {
    constructor(parent: cdk.Stack, name?: string, props?: DatabaseClusterProps, constructStore?: ConstructStore) {
        super(parent, name, props, constructStore);
        const vpc = ec2.VpcNetwork.import(this, 'production-vpc', this.ConstructStore.getSharedConstruct(props.vpcID));
        const securityGroup = new ec2.SecurityGroup(this, 'db-sg', {
            vpc
        });
        const webAppSecGroup = ec2.SecurityGroup.import(this, 'sg', this.ConstructStore.getSharedConstruct(props.webAppEC2SGName))

        securityGroup.addEgressRule(new ec2.AnyIPv4(), new ec2.TcpAllPorts(), "Allow all outbound traffic from ASG by default");
        securityGroup.addIngressRule(webAppSecGroup, new ec2.TcpPort(3306), "Allow inbound db");

        var rdscluster = new rds.DatabaseCluster(this, 'DBC', {
            defaultDatabaseName: props.DatabaseName,
            masterUser: {
                username: props.DatabaseUsername,
                password: props.DatabasePassword
            },
            engine: props.DBEngine,
            instanceProps: {
                instanceType: new ec2.InstanceTypePair(ec2.InstanceClass.Burstable2, ec2.InstanceSize.Small),
                vpc: vpc,
                vpcPlacement: {
                    subnetsToUse: ec2.SubnetType.Isolated
                }
            }
        });
    }
}