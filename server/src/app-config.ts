import { PrintPresetMap, PageFormats } from "@html-pdf-press/types";
import * as config from "config";
import * as os from "os";
import { printPresetValidatorExact } from "./validators";
import { normalizeMargins } from "./margin";

export const appConfig = {
  port: configGetInt("port"),
  chrome: {
    bin: /^win/.test(os.platform()) ? configGetString("chrome.binWindows") : configGetString("chrome.bin"),
    useChromium: configGetBoolean("chrome.useChromium"),
    useIncognito: configGetBoolean("chrome.useIncognito"),
    concurrentPages: configGetInt("chrome.concurrentPages"),
    headless: configGetBoolean("chrome.headless"),
    noSandbox: configGetBoolean("chrome.noSandbox"),
    disableGpu: configGetBoolean("chrome.disableGpu"),
    initializeOnFirstRequest: configGetBoolean("chrome.initializeOnFirstRequest", false),
  },
  presetDefault: configGetString("presetDefault", "")
    .split(",")
    .filter(s => s),
  presetBase: configGetString("presetBase", "")
    .split(",")
    .filter(s => s),
  presetFinal: configGetString("presetFinal", "")
    .split(",")
    .filter(s => s),
  presets: { ...configGetJson<PrintPresetMap>("presets") },
  formats: { ...configGetJson<PageFormats>("formats") },
  headerFooterCssResetHtml: configGetString("headerFooterCssResetHtml", ""),
};

const presets = appConfig.presets;
for (const k in presets) {
  if (presets.hasOwnProperty(k)) {
    // Clone the preset to allow modification
    const preset = (appConfig.presets[k] = { ...presets[k] });
    if ("margins" in preset) {
      preset.margins = normalizeMargins(preset.margins);
    }
    printPresetValidatorExact(presets[k]).unwrap();
  }
}

// console.dir(appConfig, { depth: null });

function configGetString<T>(key: string): string;
function configGetString<T>(key: string, defaultValue: T): string | T;
function configGetString<T>(key: string, defaultValue?: T): string | T {
  const value = config.has(key) ? config.get(key) : null;
  if (value == null) {
    if (defaultValue === undefined) {
      throw new Error(`Config: Expected ${key} to be a string`);
    } else {
      return defaultValue;
    }
  }
  if (typeof value !== "string") {
    throw new Error(`Config: Expected ${key} to be a string`);
  }
  return value;
}

function configGetBoolean<T>(key: string): boolean;
function configGetBoolean<T>(key: string, defaultValue: T): boolean | T;
function configGetBoolean<T>(key: string, defaultValue?: T): boolean | T {
  const value = config.has(key) ? config.get(key) : null;
  if (value == null) {
    if (defaultValue === undefined) {
      throw new Error(`Config: Expected ${key} to be a boolean but none was specified`);
    } else {
      return defaultValue;
    }
  }

  if (value === true || value === "true" || value === "1") {
    return true;
  } else if (value === false || value === "false" || value === "0") {
    return false;
  } else {
    throw new Error(`Config: ${key} is an invalid boolean`);
  }
}

function configGetNumber<T>(key: string): number;
function configGetNumber<T>(key: string, defaultValue: T): number | T;
function configGetNumber<T>(key: string, defaultValue?: T): number | T {
  let value = config.has(key) ? config.get(key) : null;
  if (value == null) {
    if (defaultValue === undefined) {
      throw new Error(`Config: Expected ${key} to be a number but none was specified`);
    } else {
      return defaultValue;
    }
  }

  if (typeof value === "string") {
    value = Number.parseFloat(value);
  }
  if (typeof value !== "number") {
    throw new Error(`Config: Expected ${key} to be a number`);
  }
  if (value == null || Number.isNaN(value)) {
    throw new Error(`Config: ${key} is not a valid number`);
  }

  return value;
}

function configGetInt<T>(key: string): number;
function configGetInt<T>(key: string, defaultValue: T): number | T;
function configGetInt<T>(key: string, defaultValue?: T): number | T {
  let value = config.has(key) ? config.get(key) : null;
  if (value == null) {
    if (defaultValue === undefined) {
      throw new Error(`Config: Expected ${key} to be an integer but none was specified`);
    } else {
      return defaultValue;
    }
  }

  if (typeof value === "string") {
    value = Number.parseInt(value, 10);
  }
  if (typeof value !== "number") {
    throw new Error(`Config: Expected ${key} to be an integer`);
  }
  if (Math.round(value) !== value || value == null || Number.isNaN(value)) {
    throw new Error(`Config: ${key} is not a valid integer`);
  }

  return value;
}

function configGetJson<T>(key: string, defaultValue?: T): T {
  const value = config.has(key) ? config.get(key) : null;
  if (value == null) {
    if (defaultValue === undefined) {
      throw new Error(`Config: ${key} is missing`);
    } else {
      return defaultValue;
    }
  }
  return value as T;
}
