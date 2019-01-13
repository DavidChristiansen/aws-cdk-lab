import { FluentConstruct, FluentStackProps, ConstructStore } from "fluent.aws-cdk";
import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import { SubnetType } from "@aws-cdk/aws-ec2";

export class TransitGatewayAssociationProps extends FluentStackProps {
    vpcID: string;
    transitGatewayId: cdk.IConstruct;
}

export class TransitGatewayAssociation extends FluentConstruct {
    constructor(parent: cdk.Stack, name: string, props: any, constructStore: ConstructStore) {
        super(parent, name, props, constructStore);

        const vpc = ec2.VpcNetwork.import(this, 'transitGW-mgmt-vpc', this.ConstructStore.getSharedConstruct(props.vpcID));
        const subnetIDs: string[] = [];
        vpc.subnets({
            subnetsToUse: SubnetType.Private
        }).forEach(subnet => {
            subnetIDs.push(subnet.subnetId)
        });

        const transitGWAttachment = new ec2.CfnTransitGatewayAttachment(this, 'transitGatewayAttachment', {
            vpcId: vpc.vpcId,
            subnetIds: subnetIDs,
            transitGatewayId: props.transitGatewayId,
            tags: [
                {
                    key: 'Application',
                    value: new cdk.Aws().stackName
                }
            ]
        })
    }
}