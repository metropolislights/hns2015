/*
 * 00-helloAdina
 */

// inits
var SerialPort = require('serialport').SerialPort;
var port = '/dev/ttyMFD1'; // breakout board's UART1 device name
var baud = 115200; // can be changed, as long as it's in sync with Arduino Uno
var opensImmediately = false;
var serialPort = new SerialPort(port, { baudrate : baud }, opensImmediately);

var Twitter = require('twitter');
var twitterClient = new Twitter
({
  consumer_key       : 'o13x18XJMMpljgXFdN08MFIsz',
  consumer_secret    : 'TIljUZnvanbSya99jiJLZ9Cy0WT498kwZ7uyMVd8BvroasUovP',
  access_token_key   : '3288108405-CWzNWQd4Q1hrBwlbHlTKkMbT9KLIiwlh6QMFbMd',
  access_token_secret: 'vn8ku4ERGMMrG4FmCp7xJKDuofKqomlldgBwWwQfT6kz8'
});

var PubNub = require('pubnub')
({
  ssl           : true,  // enable TLS tunneling over TCP
  publish_key   : 'pub-c-b38d8e57-ce7b-4896-9795-db9a2c494e1c',
  subscribe_key : 'sub-c-fcb17716-fefc-11e4-bb05-02ee2ddab7fe'
});
var channelName = 'sensors'
PubNub.subscribe
({
  channel: channelName,
  message: function(data) { console.log(data); } // response log
});

// globals
var tags = ["TEMP", "KORAK", "HUMY", "SOUND", "RFID", "TREASURE", "MAGNET", "FREKVENCIJA", "INFRA"];

console.log('Opening a port at '+ port + '...'); // checkpoint

var parseSerialData = function(dataString, tagArray)
{
  var output = {};
  for (i = 0; i < tagArray.length; i++)
  {
    // TODO: parser ignore logic
    var tag = tagArray[i];
    if (typeof(dataString) === 'undefined') {
      var split = dataString.split(tag);
    var value = split[1];
    dataString = split[2];
    output[tag] = value;
  }
  }
  return output;
};

var publishToPubNub = function(messageString)
{
  PubNub.publish
  ({
    channel  : channelName,
    message  : messageString,
    callback : function(e) { console.log('Publish successful!', e); },
    error    : function(e) { console.log('Publish failed!', e); }
  });
};

var tweet_func = function(tweetMsg) {
  twitterClient.post('statuses/update', {status: tweetMsg},  function(error, tweet, response){
  // console.log(tweet);     // tweet body.
  // console.log(response);  // raw response object
  });
};

var tweet_station = function()
{
  var date = new Date();
  var tweetMsg = '<RFID> ' + date.toDateString() + ' NoviSadHardnSoft2015 ' + 'B4';
  tweet_func(tweetMsg);
};

var serialEvent = function(data) // callback argument
{
  var parsedData = parseSerialData(String(data), tags);
  // ovde moraš obraditi parsirane podatke
  // sva logika za kodove koji se šalju ide ovde
  // npr., moraš da pamtiš RFID, i da registruješ promenu
  // jer na osnovu toga znaš da li da pozivaš tweet_station()
  // mislim da old / new RFID-e možeš pamtiti u globalnom var-u (na primer)
  publishToPubNub(parsedData);
};

// upon receving data through a serial port
serialPort.open(function (error)
{
  if (error) { console.log('Failed to open port.\n Reason: ' + error); }
  else
  {
    serialPort.on('data', serialEvent);
  }
});

// tweet every minute
var tweet_summary = function()
{
  var tweetMsg = 'NoviSadHardnSoft2015 summary at https://freeboard.io/board/PKiKVR'; // Treba promenuti na live tablu koja ce biti
  tweet_func(tweetMsg);
}

setInterval(function()
{
  var date = new Date();
  if ( date.getSeconds() === 0 ) { tweet_summary(); }
}, 1000);
