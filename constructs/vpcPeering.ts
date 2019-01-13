import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import { FluentConstruct, ConstructStore, FluentStackProps } from 'fluent.aws-cdk';

export class VPCPeeringProps extends FluentStackProps {
    fromVpcID: string;
    toVpcID: string;
    fromVPCCIDR: any;
    toVPCCIDR: any;
}
export class VPCPeering extends FluentConstruct {
    constructor(parent: cdk.Stack, name?: string, props?: VPCPeeringProps, constructStore?: ConstructStore) {
        super(parent, name, props, constructStore);

        const fromVpc = ec2.VpcNetwork.import(this, 'vpc1', this.ConstructStore.getSharedConstruct(props.fromVpcID));
        const toVpc = ec2.VpcNetwork.import(this, 'vpc2', this.ConstructStore.getSharedConstruct(props.toVpcID));

        const peeringConnection = new ec2.CfnVPCPeeringConnection(this, name, {
            vpcId: fromVpc.vpcId,
            peerVpcId: toVpc.vpcId
        });

        const fromVpcRouteTable = new ec2.CfnRouteTable(this, 'fromVpcRouteTable', {
            vpcId: fromVpc.vpcId,
            tags: [
                {
                    key: 'Application',
                    value: new cdk.Aws().stackName
                }, {
                    key: "Network",
                    value: "Peer Connected Subnet"
                },
                {
                    key: 'Name',
                    value: 'Peering Route Table'
                }
            ]
        });
        const fromRoute = new ec2.CfnRoute(this, 'fromRoute', {
            destinationCidrBlock: props.toVPCCIDR,
            vpcPeeringConnectionId: peeringConnection.ref,
            routeTableId: fromVpcRouteTable.ref
        });

        const toVpcRouteTable = new ec2.CfnRouteTable(this, 'toVpcRouteTable', {
            vpcId: toVpc.vpcId,
            tags: [
                {
                    key: 'Application',
                    value: new cdk.Aws().stackName
                }, {
                    key: "Network",
                    value: "Peer Connected Subnet"
                },
                {
                    key: 'Name',
                    value: 'Peering Route Table'
                }
            ]
        });
        const toRoute = new ec2.CfnRoute(this, 'toRoute', {
            destinationCidrBlock: props.fromVPCCIDR,
            vpcPeeringConnectionId: peeringConnection.ref,
            routeTableId: toVpcRouteTable.ref
        });
    }
}