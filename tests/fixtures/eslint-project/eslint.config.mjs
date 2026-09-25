import bun from "eslint-plugin-bunisms";
import parser from "@typescript-eslint/parser";
export default [bun.configs.recommended, { files: ["**/*.ts"], languageOptions: { parser } }];
