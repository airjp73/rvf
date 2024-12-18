import "@testing-library/cypress/add-commands";

beforeEach(() => {
  const parentDocument = (cy as any).state("window").parent.document;
  const iframe = parentDocument.querySelector(
    ".screenshot-height-container iframe",
  );
  iframe.removeAttribute("sandbox");
});

Cypress.Commands.add("visitWithoutJs", (url) => {
  const parentDocument = (cy as any).state("window").parent.document;
  const iframe = parentDocument.querySelector(
    ".screenshot-height-container iframe",
  );
  if (false !== Cypress.config("chromeWebSecurity")) {
    throw new TypeError(
      "When you disable script you also have to set 'chromeWebSecurity' in your config to 'false'",
    );
  }
  iframe.sandbox.add("allow-forms");
  return cy.visit(url);
});

Cypress.Commands.add("waitForJs", () => {
  return cy.findByTestId("hydrated");
});

Cypress.on("uncaught:exception", (err) => {
  // Cypress and React Hydrating the document don't get along
  // for some unknown reason. Hopefully we figure out why eventually
  // so we can remove this.
  if (
    /hydrat/i.test(err.message) ||
    /Minified React error #418/.test(err.message) ||
    /Minified React error #423/.test(err.message)
  ) {
    return false;
  }
});
