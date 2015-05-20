var pubnub = require("pubnub")({
    ssl           : true,  // <- enable TLS Tunneling over TCP 
    publish_key   : "pub-c-b38d8e57-ce7b-4896-9795-db9a2c494e1c",
    subscribe_key : "sub-c-fcb17716-fefc-11e4-bb05-02ee2ddab7fe"
});

// Sending data needs to be in JSON format object
// smting like --->>> var data = {">> variable name <<" : ">> variable data<<", ">> variable name <<" : ">> variable data<<",
// ">> variable name <<" : ">> variable data<<",">> variable name <<" : ">> variable data<<"}


// First u need to subscribe to channel then send the data
pubnub.subscribe ({
  	channel: 'my_channel',
   	message: function(data){console.log(data);}
});


// testing var only -->>	var temp = 0;
	

for(var i=;i<50;i++){				//Testing only
	var msg = {"temp1": temp };		//Testing only
	temp++;							//Testing only
 	pubnub.publish({
  	channel : 'my_channel',
  	message : msg,
  	callback  : function(e) { console.log( "SUCCESS!", e ); },
    error     : function(e) { console.log( "FAILED! RETRY PUBLISH!", e ); }
});
};
  

  