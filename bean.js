"use strict";

class Bean {
  constructor(connectedBean, broker, delayInterval) {
    this.id = connectedBean._peripheral.id;
    this.address = connectedBean._peripheral.address;
    this.localName = connectedBean._peripheral.advertisement.localName;
    this.txPowerLevel = connectedBean._peripheral.advertisement.txPowerLevel;

    connectedBean.on("accell", (x, y, z, valid) => {
      this.onAccelleration(x, y, z, valid, broker)
    });
    connectedBean.on("temp", (temp, valid) => {
      this.onTemperature(temp, valid, broker)
    });

    connectedBean.on("disconnect", () => {
      this.onDisconnect(connectedBean, broker)
    });

    let getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    connectedBean.connectAndSetup(() => {

      this.intervalId = setInterval(()=> {

        //set random led colors between 0-255. I find red overpowering so red between 0-64
        connectedBean.setColor(
          new Buffer([getRandomInt(0,64),getRandomInt(0,255),getRandomInt(0,255)]),
          () => {} // led color sent
        );
        connectedBean.requestAccell(() => {} /* request accell sent */);
        connectedBean.requestTemp(() => {} /* request temp sent */);

      }, delayInterval);

    });


  }
  onAccelleration(x, y, z, valid, broker) {
    broker.notify("accelleration", {
      id: this.id,
      address: this.address,
      localName: this.localName,
      txPowerLevel: this.txPowerLevel,
      status: valid ? "valid" : "invalid",
      accelleration: {
        x: x, y: y, z: z
      }
    });
  }
  onTemperature(temp, valid, broker) {
    broker.notify("temperature", {
      id: this.id,
      address: this.address,
      localName: this.localName,
      txPowerLevel: this.txPowerLevel,
      status: valid ? "valid" : "invalid",
      temperature: temp
    });
  }

  onDisconnect(connectedBean, broker) {
    clearInterval(this.intervalId);
    // Turning off led...
    connectedBean.setColor(new Buffer([0x0,0x0,0x0]), () => {});

    //no way to know if succesful but often behind other commands going out, so just wait 2 seconds
    // Disconnecting from Device...
    setTimeout(connectedBean.disconnect.bind(connectedBean, () => {}), 2000);
    broker.notify("disconnect", {
      id: this.id,
      address: this.address,
      localName: this.localName,
      txPowerLevel: this.txPowerLevel
    });
  }

  onMessage(topic, data) {}
}

module.exports = Bean ;
