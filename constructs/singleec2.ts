import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import autoscaling = require('@aws-cdk/aws-autoscaling');
import { FluentConstruct, ConstructStore, FluentStackProps } from 'fluent.aws-cdk';
import { SubnetType } from '@aws-cdk/aws-ec2';
import { AppStream } from 'aws-sdk';

export class Ec2Props extends FluentStackProps {
    vpcID: string;
    keyName: string;
}
export class Ec2 extends FluentConstruct {
    constructor(parent: cdk.Stack, name: string, props: Ec2Props, constructStore: ConstructStore) {
        super(parent, name, props, constructStore);

        const vpc = ec2.VpcNetwork.import(this, 'vpc', this.ConstructStore.getSharedConstruct(props.vpcID));
        const SecurityGroup = new ec2.SecurityGroup(this, name + 'SG', {
            vpc
        });
        SecurityGroup.addEgressRule(new ec2.AnyIPv4(), new ec2.TcpAllPorts(), "Allow all outbound traffic from ASG by default");
        // SecurityGroup.addIngressRule(new ec2.CidrIPv4(props.customerCIDR), new ec2.TcpPortRange(22, 22), "Allow inbound ssh");
        // SecurityGroup.addIngressRule(new ec2.CidrIPv4(props.customerCIDR), new ec2.IcmpAllTypesAndCodes(), "Allow inbound ping");

        const instanceRole = new iam.Role(this, name + 'InstanceRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        })
        const instanceProfile = new iam.CfnInstanceProfile(this, name + 'InstanceProfile', {
            roles: [instanceRole.roleName],
        })
        const launchConfig = new autoscaling.CfnLaunchConfiguration(this, name + 'LaunchConfig', {
            associatePublicIpAddress: true,
            imageId: "ami-047bb4163c506cd98",
            instanceType: "t2.micro",
            keyName: props.keyName,
            iamInstanceProfile: instanceProfile.ref,
            securityGroups: [SecurityGroup.securityGroupId],
        });
        var subnets = vpc.subnets({
            subnetsToUse: SubnetType.Public
        });
        const asg = new autoscaling.CfnAutoScalingGroup(this, name + 'ASG', {
            maxSize: "1",
            minSize: "1",
            cooldown: "300",
            desiredCapacity: "1",
            launchConfigurationName: launchConfig.ref,
            vpcZoneIdentifier: [
                subnets[0].subnetId,
                subnets[1].subnetId,
                subnets[2].subnetId,
            ],
        });
    }
}