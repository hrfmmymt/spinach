"use strict";

document.addEventListener("DOMContentLoaded", () => {
  let DOMNotifications = 0;
  const title = document.title;
  setInterval(() => {
    DOMNotifications = document.querySelector("#globalNotificationsLink > span") ? document.querySelector("#globalNotificationsLink > span").innerHTML : 0;
    document.title = "[" + DOMNotifications + "]" + title;

    console.log(document.title);
  }, 1000);

  const tooltip = document.querySelectorAll(".global-nav-content");
  Array.from(tooltip).forEach(list => {
    list.style.left = parseFloat(list.style.left) + 80 + "px !important";
  });
});
