import "@ethersproject/shims";
import toLocaleStringPolyfill from "./toLocaleStringPolyfill";
import "fast-text-encoding";

if (typeof BigInt === "undefined") global.BigInt = require("big-integer");

if (typeof btoa === "undefined") {
  global.btoa = function (str) {
    return new Buffer(str, "binary").toString("base64");
  };
}

if (typeof atob === "undefined") {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, "base64").toString("binary");
  };
}

toLocaleStringPolyfill();

if (typeof Buffer === "undefined") global.Buffer = require("buffer").Buffer;
