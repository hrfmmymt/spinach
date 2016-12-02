"use strict";

document.addEventListener("DOMContentLoaded", () => {
  let DOMNotifications = 0;
  const title = document.title;
  setInterval(() => {
    DOMNotifications = document.querySelector("#globalNotificationsLink > span") ? document.querySelector("#globalNotificationsLink > span").innerHTML : 0;
    document.title = "[" + DOMNotifications + "]" + title;

    console.log(document.title);
  }, 1000);
});
