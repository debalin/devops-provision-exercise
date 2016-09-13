## DevOps HW1: Provisioning and Configuring Servers

### Homework Spec

The homework specification can be found at https://github.com/CSC-DevOps/Course/blob/master/HW/HW1.md. 

### Brief

I have to provision virtual machines from two different providers automatically, create an NGINX server on them through Ansible and start that server. I have chosen AWS and Azure to do this assignment and Node.js to do all the automation. The testing has been completely done on bash for windows and the experience has been pretty good. :-) 

### Technologies used

1. AWS EC2
2. Azure VM
3. Node.js
4. Azure Xplat-CLI 
5. aws-sdk (Node module)
6. inquirer (Node module)
7. figlet (Node module)
8. chalk (Node module)
9. parse-json (Node module)
10. child_process (Node module)
11. Ansible (Pip module)

My program is a little CLI-interactive because it depends on the user as to what key file / password / other data he / she will be using (basically instead of harcoding my data, I have generalized this). In a practical scenario, this wouldn't be required as in an organization, the secret keys won't change all the time and it can be hardcoded in the application. In this case, however, with the intent that the TA can run the program, I assumed that a little bit of interactive-ness will help the grader. I will go through a brief of both the providers that I have chosen (AWS, Azure) one by one. 

### Steps common to both providers

1. Install Node.js:
  1. For Ubuntu/Debian based distros:<br> `curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -` <br>
`sudo apt-get install -y nodejs`
  2. For Windows: <br> `choco install nodejs` (you would need [chocolatey](https://chocolatey.org/install))
2. Install Python:
  1. For Ubuntu/Debian based distros:<br> `sudo apt-get install python2.7`
  2. For Windows: <br> `choco install python`
3. Install Pip:
  1. For Ubuntu/Debian based distros:<br> `sudo apt-get install python-pip`
  2. For Windows: <br> `choco install pip`
3. Clone my project: `git clone https://github.ncsu.edu/ddas4/CSC-DevOps_HW1.git`
4. Install dependencies for Python: `pip install -r requirements.txt` (inside my directory)
5. Install dependencies for Node: `npm install` (inside my directory)

### AWS

I have used the AWS SDK for Node.js and mainly used the `runInstances` and `describeInstances` calls. The instances created are always based off Ubuntu images and have an instance type of "t2.micro". A key pair (the name of which you have to provide) will be used to login later into the server that you just created.

#### Screencast 

A full demo of the AWS functions can be found here: https://youtu.be/b_Duh8ARV3A.

#### Pre-requisites

1. Create an AWS account.
2. Get the Secret Key and Access ID from your Amazon AWS account and store them in ~/.aws/credentials file. Ensure correct permissions are there on this file.
2. Create a Security Group with all inbound and outbound traffic allowed in your account and have the name ready with you. You might not do this, but sometimes the default security group that gets created with an instance has some traffic restrictions, which stops Ansible from logging in via SSH to those machines. An improvement of this (for my program) would be to create a security group with proper permissions on the fly as well, but I haven't done that as a part of this assignment. Moreover, for a production environment, it would be much easier to just create the security group through the UI, assign proper permissions to that and use it for all subsequent instance creations.
3. Create a Key Pair in your account, download the private key (.pem file) and store it in ~/.aws/ folder. Ensure correct permissions are there on this file.

#### Steps

1. Run program (`node provision.js`) and choose AWS as the provider.
2. Choose any of the three functions (create server, list instances, create & start NGINX server).
3. Create server will ask you for the security group and the name of the key pair in your account to associate with the new instance. You need to have both of them created in your account and the key pair.pem file in your ~/.aws/ folder. You can leave the security group field blank, then the AWS SDK will automatically create a new security group for you (refer to complications regarding that in the Pre-requisites section). 
4. List instances will list all the instances in your account and mention their states.
5. Create & start NGINX server will ask you for a running instance to choose from and the key file for that instance. Then it will connect via Ansible to that instance and set up and start the server. 

### Azure

I have used the `azure-xplat-cli` to manage the Azure resources. This is done through the `arm` (Azure Resource Management) module in the `azure-xplat-cli`. I have not used the specific Node.js SDK because it involves creating a ServicePrincipal which is pretty cumbersome (you need to have an app, etc.), so I just ignored that. The `azure-xplat-cli` is instead a very nifty tool by Microsoft for managing and creating resources for automation. It is cross-platform as implied by the name. I have used the `child_process` module to call azure CLI through Node.js. Though its a little hacky, but it works perfectly. 

#### Screencast 

A full demo for the Azure functions can be found at https://youtu.be/9b5ZPxtbprU.

#### Pre-requisites

1. Do `npm install -g azure-xplat-cli` to have this module installed on your machine. This could have been installed as a local module (keeping it in the package.json file) and thus one `npm install` would have installed this as well. But there are sometimes path problems for that and instead its better to install it globally (`npm install` for package.json only installs stuff in the `node_modules` directory). 
2. Create an Azure account. 
3. Run `azure login`. It will guide you through logging in your azure account with respect to the CLI. This is IMPORTANT.
4. Create a Resource Group in Azure and have it ready.

#### Steps

1. Run program (`node provision.js`) and choose Azure as the provider. 
2. Choose any of the three functions (create vm, list vms, create & start NGINX server).
3. In create vm, provide the Resource Group that you had created, a username for the new VM and a password. With AWS, I tested ssh key pairs for logging in and here I have tested username/password combinations. 
4. In list vms, it will show you the name of the VMs and their power states. 
5. In create & start NGINX server, it will show you the list of running instances THAT you created with this program (because it stores the usrename/password combination in your home directory, so it only allows creating NGINX servers in those VMs). After you choose one VM, Ansible will login to that VM using the username/passwrod combination stored previously in a azure_key file in your home directory, create the NGINX server and start it up. 

### Configuration Management

The CM part of this project has been taken care in the package.json file for Node.js. Thus just doing a `npm install` will take care of all setup regrading running the program. The rest of the pre-requisites are mostly account related and have to be set up manually. 
