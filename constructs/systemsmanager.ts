import cdk = require('@aws-cdk/cdk');
import iam = require('@aws-cdk/aws-iam');
import ssm = require('@aws-cdk/aws-ssm');
import { FluentConstruct, ConstructStore, FluentStackProps } from 'fluent.aws-cdk';

export class SystemsManagerProps extends FluentStackProps {
    vpcID: string;
}
export class SystemsManager extends FluentConstruct {
    constructor(parent: cdk.Stack, name?: string, props?: SystemsManagerProps, constructStore?: ConstructStore) {
        super(parent, name, props, constructStore);

        const hybridSystemsManagerRole = new iam.Role(this, 'HybridSystemsManagerRole', {
            assumedBy: new iam.ServicePrincipal('ssm.amazonaws.com'),
            path: '/',
        });
        hybridSystemsManagerRole.attachManagedPolicy("arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM");

    }
}