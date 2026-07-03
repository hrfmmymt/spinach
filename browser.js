"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const {title} = document;
  setInterval(() => {
    const element = document.querySelector("#globalNotificationsLink > span");
    const {innerHTML} = element;
    const notifications = innerHTML.length > 0 ? innerHTML : 0;
    document.title = "[" + notifications + "]" + title;

    console.log(document.title);
  }, 1000);
});
