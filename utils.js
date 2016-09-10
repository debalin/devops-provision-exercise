module.exports = {
  getUserHome: function() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  },

  guid: function() {
    var guid = "";
    for (i = 0; i < 1; i++)
      guid += randomizer();
    return guid;
  }
};

function randomizer() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
