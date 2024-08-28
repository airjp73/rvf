import configPlugin from "./config";

export default (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
) => {
  configPlugin(on, config);
  return config;
};
