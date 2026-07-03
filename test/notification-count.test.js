import test from "node:test";
import assert from "node:assert/strict";
import getNotificationCount from "../notification-count.js";

test("数値のカウントを抽出する", () => {
  assert.equal(getNotificationCount("[3]Backlog"), 3);
});

test("2桁以上のカウントを抽出する", () => {
  assert.equal(getNotificationCount("[42]プロジェクト - Backlog"), 42);
});

test("「99+」のような表記から数字部分を抽出する", () => {
  assert.equal(getNotificationCount("[99+]Backlog"), 99);
});

test("カウント0を返す", () => {
  assert.equal(getNotificationCount("[0]Backlog"), 0);
});

test("プレフィックス内に数字がなければ0を返す", () => {
  assert.equal(getNotificationCount("[•]Backlog"), 0);
});

test("空のプレフィックスは0を返す", () => {
  assert.equal(getNotificationCount("[]Backlog"), 0);
});

test("プレフィックスがないタイトルはundefinedを返す", () => {
  assert.equal(getNotificationCount("Backlog にログイン"), undefined);
});

test("空文字列はundefinedを返す", () => {
  assert.equal(getNotificationCount(""), undefined);
});

test("先頭以外の角括弧は無視する", () => {
  assert.equal(getNotificationCount("課題 [BLG-1] - Backlog"), undefined);
});
