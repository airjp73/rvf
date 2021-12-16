import "@testing-library/cypress/add-commands";

beforeEach(() => {
  const parentDocument = (cy as any).state("window").parent.document;
  const iframe = parentDocument.querySelector(".iframes-container iframe");
  iframe.removeAttribute("sandbox");
});

Cypress.Commands.add("visitWithoutJs", (url) => {
  const parentDocument = (cy as any).state("window").parent.document;
  const iframe = parentDocument.querySelector(".iframes-container iframe");
  if (false !== Cypress.config("chromeWebSecurity")) {
    throw new TypeError(
      "When you disable script you also have to set 'chromeWebSecurity' in your config to 'false'"
    );
  }
  iframe.sandbox = "allow-forms";
  return cy.visit(url);
});
