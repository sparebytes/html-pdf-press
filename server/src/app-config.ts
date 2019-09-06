import * as os from "os";
import * as config from "config";

const envMapping = {
  port: "HPP_PORT",
  "chrome.bin": "HPP_CHROME_BIN",
  "chrome.binWindows": "HPP_CHROME_BIN_WINDOWS",
  "chrome.useChromium": "HPP_CHROME_USE_CHROMIUM",
  "chrome.useIncognito": "HPP_CHROME_USE_INCOGNITO",
  "chrome.closePages": "HPP_CHROME_CLOSE_PAGES",
  "chrome.concurrentPages": "HPP_CHROME_CONCURRENT_PAGES",
  "chrome.headless": "HPP_CHROME_HEADLESS",
  "chrome.noSandbox": "HPP_CHROME_NO_SANDBOX",
  "chrome.disableGpu": "HPP_CHROME_DISABLE_GPU",
};

export const appConfig = {
  port: configGetType("port", "integer"),
  chrome: {
    bin: /^win/.test(os.platform()) ? configGetType("chrome.binWindows", "string") : configGetType("chrome.bin", "string"),
    useChromium: configGetType("chrome.useChromium", "boolean"),
    useIncognito: configGetType("chrome.useIncognito", "boolean"),
    closePages: configGetType("chrome.closePages", "boolean"),
    concurrentPages: configGetType("chrome.concurrentPages", "integer"),
    headless: configGetType("chrome.headless", "boolean"),
    noSandbox: configGetType("chrome.noSandbox", "boolean"),
    disableGpu: configGetType("chrome.disableGpu", "boolean"),
  },
};

function configGetType(key: keyof typeof envMapping, type: "string", nullable?: boolean): string;
function configGetType(key: keyof typeof envMapping, type: "string", nullable: true): string | null;
function configGetType(key: keyof typeof envMapping, type: "number" | "integer", nullable?: boolean): number;
function configGetType(key: keyof typeof envMapping, type: "number" | "integer", nullable: true): number | null;
function configGetType(key: keyof typeof envMapping, type: "boolean", nullable?: boolean): boolean;
function configGetType(key: keyof typeof envMapping, type: "boolean", nullable: true): boolean | null;
function configGetType<T = unknown>(key: keyof typeof envMapping, type: "json", nullable?: boolean): T;
function configGetType<T = unknown>(key: keyof typeof envMapping, type: "json", nullable: true): T | null;
function configGetType(key: keyof typeof envMapping, type: "string" | "number" | "integer" | "boolean" | "json", nullable: boolean = false) {
  let value = config.has(key) ? config.get(key) : null;
  if (value == null && nullable) {
    return null;
  }

  const envKey = envMapping[key];
  switch (type) {
    case "string":
      if (typeof value !== "string") {
        throw new Error(`Expected ${envKey} to be of type ${type}`);
      }
      break;

    case "number":
      if (typeof value === "string") {
        value = Number.parseFloat(value);
      }
      if (typeof value !== "number") {
        throw new Error(`Expected ${envKey} to be of type ${type}`);
      }
      if (value == null || Number.isNaN(value)) {
        throw new Error(`${envKey} is an invalid number`);
      }
      break;

    case "integer":
      if (typeof value === "string") {
        value = Number.parseInt(value, 10);
      }
      if (typeof value !== "number") {
        throw new Error(`Expected ${envKey} to be of type ${type}`);
      }
      if (value == null || Number.isNaN(value)) {
        throw new Error(`${envKey} is an invalid integer`);
      }
      break;

    case "boolean":
      if (value === true || value === "true" || value === "1") {
        value = true;
      } else if (value === false || value === "false" || value === "0") {
        value = false;
      }

      if (typeof value !== "boolean") {
        throw new Error(`Expected ${envKey} to be of type ${type}`);
      }
      break;

    case "json":
      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch (ex) {
          throw new Error(`Unable to parse JSON from ${envKey}`);
        }
      }
      break;
  }
  return value;
}
