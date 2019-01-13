import AWS = require('aws-sdk');
const parseString = require('xml2js').parseString;

class ConfigProvider {
    ec2: AWS.EC2;
    constructor() {
        var credentials = new AWS.SharedIniFileCredentials({});
        AWS.config.credentials = credentials;
        AWS.config.region = 'eu-west-1';
        this.ec2 = new AWS.EC2();
    }
    Run(): any {
        this.getVPNConfig();
    }
    getVPNConfig(): any {
        this.ec2.describeVpnConnections((err, data) => {
            if (err) {
                throw err;
            }
            if (data && data.VpnConnections) {
                let connections = data.VpnConnections.filter((conn) => {
                    return conn.State && conn.State == 'available';
                })
                connections.forEach(connection => {
                    parseString(connection.CustomerGatewayConfiguration, function (err: any, result: any) {
                        for (let index = 0; index < result.vpn_connection.ipsec_tunnel.length; index++) {
                            const tunnel = result.vpn_connection.ipsec_tunnel[index];
                            console.log(tunnel.customer_gateway[0].tunnel_outside_address[0].ip_address[0] + " " + tunnel.vpn_gateway[0].tunnel_outside_address[0].ip_address[0] + " : PSK \"" + tunnel.ike[0].pre_shared_key[0] + "\"");
                        }

                    });
                });
            }
        });
    }

}


new ConfigProvider().Run();