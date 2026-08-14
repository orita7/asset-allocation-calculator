import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  { ignores: ["dist/**"] },
  ...pluginVue.configs["flat/recommended"],
  eslintConfigPrettier,
];
