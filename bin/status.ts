import AWS = require('aws-sdk');
const parseString = require('xml2js').parseString;

class StatusProvider {
    ec2: AWS.EC2;
    constructor() {
        var credentials = new AWS.SharedIniFileCredentials({});
        AWS.config.credentials = credentials;
        AWS.config.region = 'eu-west-2';
        this.ec2 = new AWS.EC2();
    }
    Run(): any {
        this.getVPNStatus();
    }
    getVPNStatus(): any {
        this.ec2.describeVpnConnections((err, data) => {
            if (err) {
                throw err;
            }
            if (data && data.VpnConnections) {
                let connections = data.VpnConnections.filter((conn) => {
                    return conn.State && conn.State == 'available';
                })
                console.log("1: " + connections[0].VgwTelemetry[0].OutsideIpAddress + " - " + connections[0].VgwTelemetry[0].Status + " (" + connections[0].VgwTelemetry[0].StatusMessage + ") - Last Changed: " + connections[0].VgwTelemetry[0].LastStatusChange);
                console.log("2: " + connections[0].VgwTelemetry[1].OutsideIpAddress + " - " + connections[0].VgwTelemetry[1].Status + " (" + connections[0].VgwTelemetry[1].StatusMessage + ") - Last Changed: " + connections[0].VgwTelemetry[1].LastStatusChange);
            }
        });
    }

}


new StatusProvider().Run();