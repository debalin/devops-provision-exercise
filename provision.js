var AWS = require('aws-sdk');
var inquirer = require('inquirer');
var figlet = require('figlet');
var chalk = require('chalk');
var fs = require('fs');
const path = require('path');
var Ansible = require('node-ansible');
var child_process = require('child_process');
var parseJson = require('parse-json');

var utils = require(path.resolve(__dirname, './utils'));
var constants = require(path.resolve(__dirname, './constants'));

AWS.config.update({ region: 'us-west-2' });

console.log(chalk.yellow(
  figlet.textSync('DevOps HW1', { horizontalLayout: 'full' })
));

var providerQuestion = [{
  name: 'provider',
  type: 'list',
  message: 'Which provider do you want to use?',
  choices: ['AWS', 'Azure']
}];

inquirer.prompt(providerQuestion).then(function(answers) {
  switch (answers.provider) {
    case 'AWS':
      var functionQuestion = [{
        name: 'function',
        type: 'list',
        message: 'Which function do you want to choose?',
        choices: [{ name: 'Create Instance', value: 'create' },
          { name: 'Get Instance List & State', value: 'list' },
          { name: 'Create & Start NGINX Server', value: 'create_ngnix' }
        ]
      }];
      inquirer.prompt(functionQuestion).then(function(answers) {
        var ec2 = new AWS.EC2();
        switch (answers.function) {
          case 'create':
            var params = {
              ImageId: 'ami-d732f0b7',
              MaxCount: 1,
              MinCount: 1,
              InstanceType: 't2.micro',
              KeyName: 'key_pls',
              SecurityGroupIds: ['sg-23593b44']
            };

            ec2.runInstances(params, function(err, data) {
              if (err)
                console.log(err, err.stack);
              else
                console.log('New Instance created with InstanceId ' + data.Instances[0].InstanceId);
            });
            break;

          case 'list':
            ec2.describeInstances(function(err, data) {
              if (err)
                console.log(err, err.stack);
              else {
                for (var reservation of data.Reservations) {
                  for (var instance of reservation.Instances) {
                    console.log('InstanceId: ' + instance.InstanceId + ', State: ' + instance.State.Name)
                  }
                }
              }
            });
            break;

          case 'create_ngnix':
            ec2.describeInstances(function(err, data) {
              var runningInstances = [];
              if (err)
                console.log(err, err.stack);
              else {
                for (var reservation of data.Reservations) {
                  for (var instance of reservation.Instances) {
                    if (instance.State.Code == 16) {
                      runningInstances.push({
                        name: instance.InstanceId,
                        value: instance.PublicIpAddress
                      });
                    }
                  }
                }
                var runningQuestion = [{
                  name: 'running',
                  type: 'list',
                  message: 'Which running instance do you want to choose?',
                  choices: runningInstances
                }];
                inquirer.prompt(runningQuestion).then(function(answers) {
                  var inventory = "node0 ansible_ssh_host=" + answers.running + " ansible_ssh_user=ubuntu ansible_ssh_private_key_file=" + utils.getUserHome() + path.sep + ".aws" + path.sep + "key_pls.pem";
                  fs.writeFileSync('inventory', inventory);
                  var playbook = new Ansible.Playbook().playbook('nginx').inventory('inventory');
                  var promise = playbook.exec();
                  promise.then(function(success) {
                    console.log(success.output);
                    console.log("Check the web server at " + answers.running + ".");
                  }, function(error) {
                    console.error(error);
                  })
                });
              }
            });
            break;
        }
      });
      break;

    case 'Azure':
      console.log('Note: You have to interactively run "azure login" first, or the commands will not work.');
      var functionQuestion = [{
        name: 'function',
        type: 'list',
        message: 'Which function do you want to choose?',
        choices: [{ name: 'Create VM', value: 'create' },
          { name: 'Get VM Details', value: 'list' },
          { name: 'Create & Start NGINX Server', value: 'create_ngnix' }
        ]
      }];
      inquirer.prompt(functionQuestion).then(function(answers) {
        switch (answers.function) {
          case 'create':
            var createQuestion = [{
              name: 'username',
              type: 'input',
              message: 'Type in a user name for the VM: '
            }, {
              name: 'password',
              type: 'password',
              message: 'Provide a password for the VM: '
            }, {
              name: 'resource_group',
              type: 'input',
              message: 'Resource group under which you want the VM: '
            }];
            inquirer.prompt(createQuestion).then(function(answers) {
              var resourceGroup = answers.resource_group;
              var username = answers.username;
              var password = answers.password;
              var previousKeys = "";
              if (fs.existsSync(constants.azureKeyPath)) {
                previousKeys = fs.readFileSync(constants.azureKeyPath).toString();
              }
              previousKeys += constants.azureVMName + "," + username + "," + password + "\n";
              fs.writeFileSync(constants.azureKeyPath, previousKeys);
              console.log("Username and password stored in " + constants.azureKeyPath + ".");
              console.log("Following parameters will be used for the creation of the VM...");
              console.log("Resource Group: " + resourceGroup);
              console.log("VM Name: " + constants.azureVMName);
              console.log("Location: " + constants.azureLocation);
              console.log("OS Type: " + constants.azureOSType);
              console.log("Image URN: " + constants.azureImageURN);
              var createCommand = "azure vm quick-create " + resourceGroup + " " + constants.azureVMName + " " + constants.azureLocation + " " + constants.azureOSType + " " + constants.azureImageURN + " " + username + " " + password;
              console.log('Creating VM...');
              child_process.exec(createCommand, function(error, result, stderr) {
                if (error)
                  console.log('Error in creating VM.');
                else if (result) {
                  console.log('VM Created.');
                }
              });
            });
            break;

          case 'list':
            child_process.exec('azure vm list --json', function(error, result, stderr) {
              var list = parseJson(result);
              console.log('VMs in your account...');
              for (var vm of list) {
                console.log('Name: ' + vm.name + " | " + vm.powerState);
              }
            });
            break;

          case 'create_ngnix':
            child_process.exec('azure vm list-ip-address --json', function(error, result, stderr) {
              var contents = fs.readFileSync(constants.azureKeyPath).toString();
              var possibleInstances = [];
              contents = contents.split("\n");
              for (var key of contents) {
                key = key.split(",");
                possibleInstances.push(key[0]);
              }
              var list = parseJson(result);
              var runningInstances = [];
              for (var vm of list) {
                if (vm.powerState == "VM running" && possibleInstances.indexOf(vm.name) != -1) {
                  runningInstances.push({
                    name: vm.name,
                    value: [vm.name, vm.resourceGroupName, vm.networkProfile.networkInterfaces[0].expanded.ipConfigurations[0].publicIPAddress.expanded.ipAddress]
                  });
                }
              }
              var runningQuestion = [{
                name: 'running',
                type: 'list',
                message: 'Which running instance (created through this program) do you want to choose?',
                choices: runningInstances
              }];
              inquirer.prompt(runningQuestion).then(function(answers) {
                var contents = fs.readFileSync(constants.azureKeyPath).toString();
                contents = contents.split("\n");
                var username, password;
                for (var key of contents) {
                  key = key.split(",");
                  if (key[0] != answers.running[0])
                    continue;
                  username = key[1];
                  password = key[2];
                  break;
                }
                child_process.exec('export ANSIBLE_HOST_KEY_CHECKING=False', function(error, result, stderr) {
                  var inventory = "node0 ansible_ssh_host=" + answers.running[2] + " ansible_ssh_user=" + username + " ansible_ssh_pass=" + password;
                  fs.writeFileSync('inventory', inventory);
                  var playbook = new Ansible.Playbook().playbook('nginx').inventory('inventory');
                  var promise = playbook.exec();
                  promise.then(function(success) {
                    console.log(success.output);
                    console.log("Check the web server at " + answers.running[2] + ".");
                  }, function(error) {
                    console.error(error);
                  });
                });
              });
            });
            break;
        }
      });
      break;
  }
});
