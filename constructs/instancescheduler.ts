import cdk = require('@aws-cdk/cdk');
import { FluentConstruct, ConstructStore, FluentStackProps } from 'fluent.aws-cdk';

export enum InstanceSchedulerServiceType {
    EC2,
    RDS,
    Both
}

export class InstanceSchedulerProps extends FluentStackProps {
    vpcID: string;
    tagName: string;
    servicesToSchedule: InstanceSchedulerServiceType;
    enabled: boolean;
    freqency: number = 5;
    enableCloudWatchMetrics: boolean = false;
    memorySize: number = 128;
    enableCloudWatchLogs: boolean = false;
    logRetentionDays: number = 30;
}
export class InstanceScheduler extends FluentConstruct {
    constructor(parent: cdk.Stack, name?: string, props?: InstanceSchedulerProps, constructStore?: ConstructStore) {
        super(parent, name, props, constructStore);


    }
}