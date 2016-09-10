var path = require('path');
var utils = require(path.resolve(__dirname, './utils'));

module.exports = {
  azureVMName: "ubuntu" + utils.guid(),
  azureLocation: "southcentralus",
  azureOSType: "Linux",
  azureImageURN: "canonical:UbuntuServer:16.04.0-LTS:16.04.201604203",
  azureKeyPath: utils.getUserHome() + path.sep + "azure_key"
}
