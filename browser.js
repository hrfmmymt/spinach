"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const updateTitle = () => {
    const link = document.querySelector("#globalNotificationsLink");
    if (!link) {
      return;
    }

    const text = link.querySelector("span")?.textContent.trim() ?? "";
    const notifications = text.length > 0 ? text : "0";
    const baseTitle = document.title.replace(/^\[[^\]]*\]/v, "");
    const newTitle = `[${notifications}]${baseTitle}`;

    if (document.title !== newTitle) {
      document.title = newTitle;
    }
  };

  updateTitle();

  const observer = new MutationObserver(updateTitle);
  observer.observe(document.body, {childList: true, subtree: true, characterData: true});

  const titleElement = document.querySelector("title");
  if (titleElement) {
    observer.observe(titleElement, {childList: true, subtree: true, characterData: true});
  }
});
