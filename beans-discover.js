"use strict";
let BeansMother = require('ble-bean');
let Bean = require('./bean.js');
let Broker = require('./broker.js');

let beans = [];
beans.onMessage = (topic, data) => {
  console.log(topic, data);
  if(topic=="disconnect") { // remove bean from beans
    beans.slice(
      beans.indexOf(beans.find((bean) => bean.id = data.id)),
      1
    );
  }
}

let messagesBroker = new Broker();

messagesBroker.addSubscription("disconnect", beans);
messagesBroker.addSubscription("temperature", beans);
messagesBroker.addSubscription("accelleration", beans);

console.log("discovering beans ...")
BeansMother.discoverAll(connectedBean => {
  let bean = new Bean(connectedBean, messagesBroker, 1000);
  beans.push(bean);
  console.log("---------------------------------------");
  console.log(bean);
  console.log("---------------------------------------");

});
