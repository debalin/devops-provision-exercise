var AWS = require('aws-sdk');
var inquirer = require('inquirer');
var figlet = require('figlet');
var chalk = require('chalk');
var fs = require('fs');
const path = require('path');
var Ansible = require('node-ansible');

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
          { name: 'Create NGINX Server', value: 'create_ngnix' }
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
                  var inventory = "node0 ansible_ssh_host=" + answers.running + " ansible_ssh_user=ubuntu ansible_ssh_private_key_file=" + getUserHome() + path.sep + ".aws" + path.sep + "key_pls.pem";
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
      break;
  }
});

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
