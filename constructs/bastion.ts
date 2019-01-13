import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import autoscaling = require('@aws-cdk/aws-autoscaling');
import { FluentConstruct, ConstructStore, FluentStackProps } from 'fluent.aws-cdk';
import { SubnetType } from '@aws-cdk/aws-ec2';

export class BastionProps extends FluentStackProps {
    vpcID: string;
    keyName: string;
    customerCIDR: string;
}
export class Bastion extends FluentConstruct {
    constructor(parent: cdk.Stack, name: string, props: BastionProps, constructStore: ConstructStore) {
        super(parent, name, props, constructStore);

        const vpc = ec2.VpcNetwork.import(this, 'bastion-vpc', this.ConstructStore.getSharedConstruct(props.vpcID));
        const SecurityGroup = new ec2.SecurityGroup(this, 'bastion-SG', {
            vpc
        });
        SecurityGroup.addEgressRule(new ec2.AnyIPv4(), new ec2.TcpAllPorts(), "Allow all outbound traffic from ASG by default");
        SecurityGroup.addIngressRule(new ec2.CidrIPv4(props.customerCIDR), new ec2.TcpPortRange(22, 22), "Allow inbound ssh");
        SecurityGroup.addIngressRule(new ec2.CidrIPv4(props.customerCIDR), new ec2.IcmpAllTypesAndCodes(), "Allow inbound ping");

        const bastionInstanceRole = new iam.Role(this, 'bastionRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        })
        const bastionInstanceProfile = new iam.CfnInstanceProfile(this, 'instanceprofile', {
            roles: [bastionInstanceRole.roleName],
        })
        const bastionLaunchConfig = new autoscaling.CfnLaunchConfiguration(this, 'bastionLaunchConfig', {
            associatePublicIpAddress: false,
            imageId: "ami-047bb4163c506cd98",
            // imageId: "ami-f976839e",
            instanceType: "t2.micro",
            keyName: props.keyName,
            iamInstanceProfile: bastionInstanceProfile.ref,
            securityGroups: [SecurityGroup.securityGroupId],
        });

        var subnets = vpc.subnets({
            subnetsToUse: SubnetType.Private
        });
        const asg = new autoscaling.CfnAutoScalingGroup(this, 'BastionASG', {
            maxSize: "1",
            minSize: "1",
            cooldown: "300",
            desiredCapacity: "1",
            launchConfigurationName: bastionLaunchConfig.ref,
            vpcZoneIdentifier: [
                subnets[0].subnetId,
                subnets[1].subnetId,
                subnets[2].subnetId,
            ]
        });
    }
}