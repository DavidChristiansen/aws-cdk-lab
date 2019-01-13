import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import { FluentConstruct, ConstructStore, IFluentStackProps, FluentStackProps } from 'fluent.aws-cdk';
import { SubnetType } from '@aws-cdk/aws-ec2';

export class VPNProps extends FluentStackProps {
    customerGatewayIpAddress: string;
    vpcID: string;
}
export class VPN extends FluentConstruct {
    constructor(parent: cdk.Stack, name: string, props: VPNProps, constructStore: ConstructStore) {
        super(parent, name, props, constructStore);

        const vpc = ec2.VpcNetwork.import(this, 'vpn-vpc', this.ConstructStore.getSharedConstruct(props.vpcID));

        const customerGateway = new ec2.CfnCustomerGateway(this, 'customergateway', {
            ipAddress: props.customerGatewayIpAddress,
            bgpAsn: 65000,  // Default value - static routing
            type: 'ipsec.1',
            tags: [
                {
                    key: 'Application',
                    value: new cdk.Aws().stackName
                },
                {
                    key: 'VPN',
                    value: 'Gateway to ' + props.customerGatewayIpAddress
                }
            ]
        });

        // const vpnGateway = new ec2.CfnVPNGateway(this, 'vpngateway', {
        //     type: 'ipsec.1',
        //     tags: [
        //         {
        //             key: 'Name',
        //             value: 'DCLab VPN Gateway'
        //         }
        //     ]
        // });

        // const privateNetworkAcl = new ec2.CfnNetworkAcl(this, 'privateNetworkACL', {
        //     vpcId: vpc.vpcId,
        //     tags: [
        //         {
        //             key: 'Application',
        //             value: new cdk.AwsStackName().toString()
        //         }, {
        //             key: "Network",
        //             value: "VPN Connected Subnet"
        //         },
        //         {
        //             key: 'Name',
        //             value: 'Private Network ACL'
        //         }
        //     ]
        // });
        // new ec2.CfnNetworkAclEntry(this, 'inboundPrivateNetworkACLentry', {
        //     cidrBlock: '10.0.0.0/8',
        //     egress: false,
        //     networkAclId: privateNetworkAcl.ref,
        //     protocol: -1,
        //     ruleAction: "allow",
        //     ruleNumber: 100,
        // });
        // new ec2.CfnNetworkAclEntry(this, 'outboundPrivateNetworkACLentry', {
        //     cidrBlock: '10.0.0.0/8',
        //     egress: true,
        //     networkAclId: privateNetworkAcl.ref,
        //     protocol: -1,
        //     ruleAction: "allow",
        //     ruleNumber: 100,
        // });
        // const privateRouteTable = new ec2.CfnRouteTable(this, 'privateRouteTable', {
        //     vpcId: vpc.vpcId,
        //     tags: [
        //         {
        //             key: 'Application',
        //             value: new cdk.AwsStackName().toString()
        //         }, {
        //             key: "Network",
        //             value: "VPN Connected Subnet"
        //         },
        //         {
        //             key: 'Name',
        //             value: 'VPN Route Table'
        //         }
        //     ]
        // });

        // const subnets = vpc.subnets({
        //     subnetsToUse: ec2.SubnetType.Private
        // });
        // for (let index = 0; index < subnets.length; index++) {
        //     const subnet = subnets[index];
        //     new ec2.CfnSubnetNetworkAclAssociation(this, 'privateSubnetACL' + index, {
        //         networkAclId: privateNetworkAcl.ref,
        //         subnetId: subnet.subnetId
        //     })
        //     new ec2.CfnSubnetRouteTableAssociation(this, 'routeTableAssoc' + index, {
        //         routeTableId: privateRouteTable.ref,
        //         subnetId: subnet.subnetId
        //     })
        // }



        // const vpnConnection = new ec2.CfnVPNConnection(this, 'vpnconnection', {
        //     customerGatewayId: customerGateway.ref,
        //     vpnGatewayId: vpnGateway.ref,
        //     staticRoutesOnly: true,
        //     type: 'ipsec.1',
        // });

        // new ec2.CfnVPNConnectionRoute(this, 'vpnRoute', {
        //     destinationCidrBlock: '10.100.0.0/16',
        //     vpnConnectionId: vpnConnection.ref,
        // });

        this.ConstructStore.SharedResources['customer-gateway'] = customerGateway;
    }
}