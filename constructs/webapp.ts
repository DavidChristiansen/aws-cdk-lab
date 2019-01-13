import { FluentConstruct, FluentStackProps, ConstructStore } from "fluent.aws-cdk";
import cdk = require('@aws-cdk/cdk');

export class EC2WebAppProps extends FluentStackProps {
    vpcID: string;
    keyName: string;
}

export class EC2WebApp extends FluentConstruct {
    constructor(parent: cdk.Stack, name: string, props: any, constructStore: ConstructStore) {
        super(parent, name, props, constructStore);

    }
}