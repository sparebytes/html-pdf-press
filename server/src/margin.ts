import { MarginsNormalized, Margins } from "@html-pdf-press/types";

export function normalizeMargins(margins: Margins | null | undefined): MarginsNormalized {
  if (margins == null || margins === "") {
    return {};
  } else if (typeof margins === "number") {
    return makeNormalizedMargins(margins);
  } else if (typeof margins === "string") {
    return makeNormalizedMargins(...margins.split(/[, ]/g));
  } else if (Array.isArray(margins)) {
    return makeNormalizedMargins(...margins);
  } else {
    return makeNormalizedMargins(margins.top, margins.right, margins.bottom, margins.left);
  }
}

function makeNormalizedMargins(
  top?: string | number | null,
  right?: string | number | null,
  bottom?: string | number | null,
  left?: string | number | null,
): MarginsNormalized {
  if (arguments.length === 1) {
    right = top;
    bottom = top;
    left = top;
  } else if (arguments.length === 2) {
    left = right;
    bottom = top;
  }
  const result: MarginsNormalized = {};
  const t = normalizeMargin(top);
  if (t != null) {
    result.top = t;
  }
  const r = normalizeMargin(right);
  if (r != null) {
    result.right = r;
  }
  const b = normalizeMargin(bottom);
  if (b != null) {
    result.bottom = b;
  }
  const l = normalizeMargin(left);
  if (l != null) {
    result.left = l;
  }
  return result;
}

function normalizeMargin(margin: string | number | null | undefined) {
  if (margin === "") {
    return null;
  } else if (typeof margin === "number") {
    return margin.toString();
  } else if (margin === "") {
    return null;
  } else {
    return margin;
  }
}
