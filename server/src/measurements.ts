import { measureHeight } from "@html-pdf-press/puppeteer-util";

type MeasurementUnit = "px" | "in" | "cm" | "mm";

const measurementRegex = /^\s*((?:\d*)(?:\.\d*)?)(px|in|cm|mm|)\s*$/;

const pixelsPerUnit: { [K in MeasurementUnit]: (scalar: number) => number } = {
  px: (pixels: number) => pixels,
  in: (inches: number) => inches * 96,
  cm: (centimeters: number) => centimeters * 37.8,
  mm: (millimeters: number) => millimeters * 378,
};

export function measurementToPixels(input: null | undefined): null;
export function measurementToPixels(input: string | number): number;
export function measurementToPixels(input: string | number | null | undefined): number | null {
  if (input == null) {
    return null;
  } else if (typeof input === "number") {
    return input;
  } else if (input === "0") {
    return 0;
  } else {
    const parts = measurementRegex.exec(input);
    if (!parts) {
      throw new Error("measurementToPixels: Unable to parse measurement: " + input);
    }
    const [_1, scalarString, measurementUnit] = parts;
    const scalar = parseFloat(scalarString);
    if (scalar == null || isNaN(scalar)) {
      throw new Error("measurementToPixels: Unable to parse measurement scalar: " + input);
    }
    const converter = pixelsPerUnit[measurementUnit as MeasurementUnit];
    if (!converter) {
      throw new Error("measurementToPixels: No conversion to pixels is available for this measurement: " + input);
    }
    const result = converter(scalar);
    return result;
  }
}

export function scaleMeasurement(input: null | undefined, scale: number | null | undefined): null;
export function scaleMeasurement(input: string, scale: number | null | undefined): string;
export function scaleMeasurement(input: number, scale: number | null | undefined): number;
export function scaleMeasurement(input: string | number | null | undefined, scale: number | null | undefined): string | number | null | undefined {
  if (input == null) {
    return null;
  } else if (scale == null || scale === 1) {
    return input;
  } else if (typeof input === "number") {
    const output = input * scale;
    return output;
  } else if (input === "0") {
    return "0";
  } else {
    const parts = measurementRegex.exec(input);
    if (!parts) {
      throw new Error("scaleMeasurement: Unable to parse measurement: " + input);
    }
    const [_1, scalarString, measurementUnit] = parts;
    const scalar = parseFloat(scalarString);
    if (scalar == null || isNaN(scalar)) {
      throw new Error("scaleMeasurement: Unable to parse measurement scalar: " + input);
    }
    const output = scalar * scale;
    return `${output}${measurementUnit}`;
  }
}
