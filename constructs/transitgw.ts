import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import { FluentConstruct, ConstructStore, FluentStackProps } from 'fluent.aws-cdk';
import { SubnetType } from '@aws-cdk/aws-ec2';

export class TransitGWProps extends FluentStackProps {
    vpcID: string;
}
export class TransitGW extends FluentConstruct {

    constructor(parent: cdk.Stack, name?: string, props?: TransitGWProps, constructStore?: ConstructStore) {
        super(parent, name, props, constructStore);

        const vpc = ec2.VpcNetwork.import(this, 'transitGW-mgmt-vpc', this.ConstructStore.getSharedConstruct(props.vpcID));
        const transitGW = new ec2.CfnTransitGateway(this, 'transitgateway', {
            tags: [
                {
                    key: 'Application',
                    value: new cdk.Aws().stackName
                },
                {
                    key: 'Name',
                    value: 'Master Transit Gateway'
                }
            ]
        })
        var output = new cdk.Output(this, 'transit-gateway-id', {
            value: transitGW.transitGatewayId,
            export: 'transit-gateway-id'
        });
        var outputValue = output.makeImportValue();
        this.StoreOutput('transit-gateway-id', outputValue);

        const subnetIDs: string[] = [];
        vpc.subnets({
            subnetsToUse: SubnetType.Private
        }).forEach(subnet => {
            subnetIDs.push(subnet.subnetId)
        });

        // const transitGatewayRouteTable = new ec2.CfnTransitGatewayRouteTable(this, 'transitGatewayRouteTable', {
        //     transitGatewayId: transitGW.transitGatewayId
        // });
        // const transitGWAttachment = new ec2.CfnTransitGatewayAttachment(this, 'transitGatewayAttachment', {
        //     vpcId: vpc.vpcId,
        //     subnetIds: subnetIDs,
        //     transitGatewayId: transitGW.transitGatewayId,
        //     tags: [
        //         {
        //             key: 'Application',
        //             value: new cdk.AwsStackName().toString()
        //         }
        //     ]
        // })
        // const gatewayRouteAssociation = new ec2.CfnTransitGatewayRouteTableAssociation(this, 'transitGatewayRouteAssociation', {
        //     transitGatewayAttachmentId: transitGWAttachment.transitGatewayAttachmentId,
        //     transitGatewayRouteTableId: transitGatewayRouteTable.transitGatewayRouteTableId,
        // })
        // gatewayRouteAssociation.addDependency(transitGatewayRouteTable);
        // // gatewayRouteAssociation.addDependency(transitGWAttachment);

        // const transitGatewayRoute = new ec2.CfnTransitGatewayRoute(this, 'transitGWRoute', {
        //     destinationCidrBlock: '10.100.0.0/16',
        //     transitGatewayAttachmentId: transitGWAttachment.transitGatewayAttachmentId,
        //     transitGatewayRouteTableId: transitGatewayRouteTable.transitGatewayRouteTableId
        // })
    }
}