import { PrintRequest, PrintPreset } from "@html-pdf-press/types";
import { assertTypeFn } from "typesmith";

export const printRequestValidator = assertTypeFn<PrintRequest>({
  coerceTypes: true,
  removeAdditional: "failing",
});

export const printPresetValidatorExact = assertTypeFn<PrintPreset>({
  coerceTypes: false,
  removeAdditional: false,
});
