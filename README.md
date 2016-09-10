## DevOps HW1: Provisioning and Configuring Servers

### Homework Spec

The homework specification can be found at https://github.com/CSC-DevOps/Course/blob/master/HW/HW1.md. 

### Brief

I have to provision virtual machines from two different providers automatically, create an NGINX server on them through Ansible and start that sever. I have chosen AWS and Azure to do this assignment and Node.js to do all the automation. The testing has been completely done on bash for windows. :-) 

### Technologies used

1. AWS EC2
2. Azure VM
3. Node.js
4. AWS SDK for Node.js
5. Azure Xplat-CLI 
6. inquirer (Node module)
7. figlet (Node module)
8. chalk (Node module)
9. parse-json (Node module)
10. child_process (Node module)
11. Ansible

My program is CLI-interactive because it depends on the user as to what key file / password / other data he / she will be using (basically instead of harcoding my data, I have generalized this). In a practical scenario, this wouldn't be required as in an organization, the secret keys won't change all the time and it can be hardcoded in the application. In this case, however, with the intent that the TA can run the program, I assumed that a little bit of interactive-ness will help the grader. I will go through a brief of both the providers that I have chosen (AWS, Azure) one by one. 

### AWS

I have used the AWS SDK for Node.js and mainly used the `runInstances` and `describeInstances` calls. The instances created are always based off Ubuntu images and have an instance type of "t2.micro". A key pair (the name of which you have to provide) will be used to login later into the server that you just created.

#### Pre-requisites

1. Get secret key and access ID from your Amazon AWS account and store them in ~/.aws/credentials file.
2. Create a security group in your account and have the name ready. 
3. Create a key pair in your account, download the private key (.pem file) and store it in ~/.aws/ folder.

#### Steps

1. Do `npm install` on the root directory after cloning my project. 
2. Run program (`node provision.js`) and choose AWS as the provider.
3. Choose any of the three functions (create server, list instances, create & start NGINX server).
4. Create server will ask you for the security group and the name of the key pair in your account to associate with the new instance. You need to have both of them created in your account and the key pair.pem file in your ~/.aws/ folder. You can leave the security group field blank, then the AWS SDK will automatically create a new security group for you. 
5. List instances will list all the instances in your account and mention their states.
6. Create & start NGINX server will ask you for a running instance to choose from and the key file for that instance. Then it will connect via Ansible to that instance and set up and start the server. 

#### Screencast 

A full demo of the AWS functions can be found here: .

### Azure

### Configuration Management

The CM part of this project has been taken care in the package.json file for Node.js. Thus just doing a `npm install` will take care of all setup regrading running the program. 
