var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var gpio = require('rpi-gpio');
var YeelightSearch = require('yeelight-wifi');

var err = null;

console.log('hi!');

// '0x0000000002b031f7'

var hardware = {
    yeelightSearch: new YeelightSearch(),
    bulb: null,
    initialize: function () {
        hardware.yeelightSearch.on('found', function (bulb) {
            hardware.bulb = bulb;
        });
    },
    setState: function (value, callback) {
        if (value) {
            hardware.bulb.turnOn('smooth', 1000)
                .then(x => callback());
        } else {
            hardware.bulb.turnOff('smooth', 1000)
                .then(x => callback());
        }
    },
    getState: function(callback) {
        hardware.bulb.getValues(['power'])
            .then(x => console.log(x));
    },
    setBrightness: function(brightness, callback) {
        hardware.bulb.setBrightness(brightness, 'smooth', 100)
            .then(x => callback());
    },
    getBrightness: function(callback) {
        hardware.bulb.getValues(['bright'])
            .then(x => console.log(x));
    }
};

hardware.initialize();

var lightUUID = uuid.generate('hap-nodejs:accessories:YeelightWhite');

var light = exports.accessory = new Accessory('YeelightWhite', lightUUID);

light.username = "13:37:3C:4D:5D:EE";
light.pincode = "420-42-420";

light
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, "Lyralabs")
    .setCharacteristic(Characteristic.Model, "Yeelight Bridge Rev-1")
    .setCharacteristic(Characteristic.SerialNumber, "0002");

light
    .addService(Service.Lightbulb, "Yeelight Standlicht")
    .getCharacteristic(Characteristic.On)
    .on('set', function (value, callback) {
        hardware.setState(value, callback);
    });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.

// light
//     .getService(Service.Lightbulb)
//     .getCharacteristic(Characteristic.On)
//     .on('get', function (callback) {

//         // this event is emitted when you ask Siri directly whether your light is on or not. you might query
//         // the light hardware itself to find this out, then call the callback. But if you take longer than a
//         // few seconds to respond, Siri will give up.

//         hardware.getState(x => {
//             console.log('Are we on?', x);
//             callback(null, x);
//         });
//     });

light
    .getService(Service.Lightbulb)
    .addCharacteristic(Characteristic.Brightness)
    // .on('get', function (callback) {
    //     hardware.getBrightness(x => {
    //         console.log('get brightness response:', x);
    //         callback(null, x);
    //     });
    //     // callback(null, hardware.brightness);
    // })
    .on('set', function (value, callback) {
        console.log('set brightness', value);
        hardware.setBrightness(value, callback);
        // callback();
    })