// Plugin taken from Kent C Dodds' Remix app
export default (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
) => {
  on("before:browser:launch", (browser, options) => {
    if (browser.name === "chrome") {
      options.args.push(
        "--no-sandbox",
        "--allow-file-access-from-files",
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--use-file-for-fake-audio-capture=cypress/fixtures/sample.wav",
      );
    }
    return options;
  });

  on("task", {
    log(message) {
      console.log(message);
      return null;
    },
  });

  return config;
};
