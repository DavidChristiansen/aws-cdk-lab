
            8888888b.  .d8888b.              .d8888b. 8888888b. 888    d8P             888            d8888888888b.   
            888  "Y88bd88P  Y88b            d88P  Y88b888  "Y88b888   d8P              888           d88888888  "88b  
            888    888888    888            888    888888    888888  d8P               888          d88P888888  .88P  
            888    888888                   888       888    888888d88K                888         d88P 8888888888K.  
            888    888888                   888       888    8888888888b               888        d88P  888888  "Y88b 
            888    888888    888   888888   888    888888    888888  Y88b     888888   888       d88P   888888    888 
            888  .d88PY88b  d88P            Y88b  d88P888  .d88P888   Y88b             888      d8888888888888   d88P 
            8888888P"  "Y8888P"              "Y8888P" 8888888P" 888    Y88b            88888888d88P     8888888888P"  

# Experimenting with the CI-CD Pipeline
1. Run `npm run build` to compile the typescript into javascript
2. Run `./deploy.sh lab-Pipeline` to deploy the CI-CD pipeline
3. Make a change to a file and push the repo - watch as things happen as if by magic 
4. Make history
5. Run `cdk destroy` to remove the lab


# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

