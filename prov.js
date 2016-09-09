var AWS = require('aws-sdk');
var inquirer = require('inquirer');
var figlet = require('figlet');
var chalk = require('chalk');

AWS.config.update({region: 'us-west-2'});

console.log(chalk.yellow(
	figlet.textSync('DevOps HW1', { horizontalLayout: 'full' })
));

var providerQuestion = [
	{
		name: 'provider',
		type: 'list',
		message: 'Which provider do you want to use?',
		choices: ['AWS', 'Azure']
	}
];

inquirer.prompt(providerQuestion).then(function (answers) {
	switch (answers.provider) {
		case 'AWS':
			var functionQuestion = [
				{
					name: 'function',
					type: 'list',
					message: 'Which function do you choose?',
					choices: [{name: 'Create Instance', value: 'create'}, {name: 'Get Instance List', value: 'list'}]
				}
			];
			inquirer.prompt(functionQuestion).then(function (answers) {
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
										console.log('InstanceId: ' + instance.InstanceId + ' State: ' + instance.State.Name)
									}
								}
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