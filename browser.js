'use strict';

const electron = require('electron');
const config = require('./config');

document.addEventListener('DOMContentLoaded', () => {
  setInterval(function() {
    let DOMNotifications = document.querySelector('#globalNotificationsLink > span').innerHTML;
    config.set('notifications', DOMNotifications);
  }, 1000);
});