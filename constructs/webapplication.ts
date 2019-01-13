import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import { FluentConstruct, ConstructStore, FluentStackProps } from 'fluent.aws-cdk';
import iam = require('@aws-cdk/aws-iam');
import autoscaling = require('@aws-cdk/aws-autoscaling');
import elb = require('@aws-cdk/aws-elasticloadbalancingv2');
import { SubnetType } from '@aws-cdk/aws-ec2';
import { ApplicationProtocol, TargetType } from '@aws-cdk/aws-elasticloadbalancingv2';
export class WebApplicationProps extends FluentStackProps {
    vpcID: string;
    keyName: string;
}
export class WebApplication extends FluentConstruct {
    constructor(parent: cdk.Stack, name?: string, props?: WebApplicationProps, constructStore?: ConstructStore) {
        super(parent, name, props, constructStore);

        const vpc = ec2.VpcNetwork.import(this, 'application-vpc', this.ConstructStore.getSharedConstruct(props.vpcID));

        const securityGroup = new ec2.SecurityGroup(this, 'labwebapp-SG', {
            vpc
        });
        securityGroup.addEgressRule(new ec2.AnyIPv4(), new ec2.TcpAllPorts(), "Allow all outbound traffic from ASG by default");
        securityGroup.addIngressRule(new ec2.AnyIPv4(), new ec2.TcpPort(22), "Allow inbound SSH");
        securityGroup.addIngressRule(new ec2.AnyIPv4(), new ec2.TcpPort(80), "Allow inbound HTTP");
        securityGroup.addIngressRule(new ec2.AnyIPv4(), new ec2.TcpPort(443), "Allow inbound HTTPS");
        this.ConstructStore.setSharedConstruct('sg_' + name, securityGroup.export());
        const webappInstanceRole = new iam.Role(this, 'labwebapp-role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        })
        const webappInstanceProfile = new iam.CfnInstanceProfile(this, name + 'labwebappInstanceProfile', {
            roles: [webappInstanceRole.roleName],
        })

        const setupScript = "#!/bin/bash\r" +
            "yum update -y\r" +
            "amazon-linux-extras install -y lamp-mariadb10.2-php7.2 php7.2\r" +
            "yum install -y httpd mariadb-server\r" +
            "systemctl start httpd\r" +
            "systemctl enable httpd\r" +
            "usermod -a -G apache ec2-user\r" +
            "chown -R ec2-user:apache /var/www\r" +
            "chmod 2775 /var/www\r" +
            "find /var/www -type d -exec chmod 2775 {} \;\r" +
            "find /var/www -type f -exec chmod 0664 {} \;\r" +
            "echo \"<? php phpinfo(); ?> \" > /var/www/html/phpinfo.php"

        const webappLaunchConfig = new autoscaling.CfnLaunchConfiguration(this, name + 'lebappLaunchConfig', {
            associatePublicIpAddress: false,
            imageId: "ami-047bb4163c506cd98",
            instanceType: "t2.micro",
            blockDeviceMappings: [
                {
                    deviceName: "/dev/sda1",
                    ebs: { volumeSize: 50, encrypted: true, volumeType: 'gp2' }
                }, {
                    deviceName: "/dev/sdf",
                    ebs: { volumeSize: 50, encrypted: true, volumeType: 'gp2' }
                }
            ],
            keyName: props.keyName,
            iamInstanceProfile: webappInstanceProfile.ref,
            securityGroups: [securityGroup.securityGroupId],
            userData: cdk.Fn.base64(setupScript)
        });
        webappLaunchConfig.addDependency(vpc);
        var subnets = vpc.subnets({
            subnetsToUse: SubnetType.Private
        });
        var targetGroup = new elb.ApplicationTargetGroup(this, name + 'appTarget', {
            vpc,
            protocol: ApplicationProtocol.Http,
            slowStartSec: 120,
        })
        const alb = new elb.ApplicationLoadBalancer(this, name + 'webappLB', {
            vpc,
            http2Enabled: true,
            vpcPlacement: {
                subnetsToUse: SubnetType.Public
            },
            internetFacing: true
        });
        alb.addListener('http', {
            port: 80,
            protocol: ApplicationProtocol.Http,
            defaultTargetGroups: [targetGroup],
            open: true
        })
        new autoscaling.CfnAutoScalingGroup(this, name + 'webappASG', {
            maxSize: "1",
            minSize: "1",
            cooldown: "300",
            desiredCapacity: "1",
            launchConfigurationName: webappLaunchConfig.ref,
            targetGroupArns: [targetGroup.targetGroupArn],
            vpcZoneIdentifier: [
                subnets[0].subnetId,
                subnets[1].subnetId,
                subnets[2].subnetId,
            ],
        });
    }
}