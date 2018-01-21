var exec = require("child_process").exec;
var Service, Characteristic, ChannelCharacteristic;

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  makeChannelCharacteristic();
  
  homebridge.registerAccessory("homebridge-tv-cmd", "TvCmd", TvCmd);
}

function TvCmd(log, config) {
	this.log = log;
	this.name = config.name;
	this.on_cmd = config.on_cmd || config.power_cmd;
	this.off_cmd = config.off_cmd || config.power_cmd;
	this.state_cmd = config.state_cmd;

	this.service = new Service.Switch(this.name);

	this.service
		.getCharacteristic(Characteristic.On)
		.on("get", this.getOn.bind(this))
		.on("set", this.setOn.bind(this));

	this.service
		.addCharacteristic(ChannelCharacteristic)
		.on('get', this.getChannel.bind(this))
		.on('set', this.setChannel.bind(this));
}

TvCmd.prototype = {
	getServices: function() {
		return [this.service];
	},

	cmdRequest: function(cmd, callback) {
		exec(cmd,function(error, stdout, stderr) {
			callback(error, stdout, stderr)
		})
	},

	getChannel: fucntion() {
		callback(null, 0);
	},
	setChannel: fucntion(channel, callback) {
		this.log(channel);
		callback(null, 0);
	},
	
	getOn: function(powerOn, callback) {
		var self = this;
		var cmd = this.state_cmd;

		this.cmdRequest(cmd, function(error, stdout, stderr) {
			var state = error ? false : true;
			if (stderr) {
				self.log("Fail to check " + powerOn.name + " state.")
				self.log(stderr)
			}
			callback(stderr, state);
		}.bind(this));
	},
	setOn: function(powerOn, callback) {
		var self = this;
		var cmd = powerOn ? this.on_cmd : this.off_cmd;

		this.cmdRequest(cmd, function(error, stdout, stderr) {
			if (error) {
				self.log("Failed to turn " + (state ? "on " : "off ") + self.name);
				callback(error);
			} else {
				callback();
				self.log(stdout);
			}
		}.bind(this));
	}
};

function makeChannelCharacteristic() {

  ChannelCharacteristic = function () {
    Characteristic.call(this, 'Channel', 'B0BA8AE0-0ADF-4874-9E09-77A6CEC021A8');
    this.setProps({
      format: Characteristic.Formats.STRING,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
    });
    this.value = this.getDefaultValue();
  };

  inherits(ChannelCharacteristic, Characteristic);
}
