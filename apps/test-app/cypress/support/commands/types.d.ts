/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to visit a url with javascript disabled.
     * @example cy.visitWithoutJs("/teacher")
     */
    visitWithoutJs(url: string): void;

    /**
     * Custom command to ensure JS is loaded before continuing..
     * @example cy.visit("/teacher").waitForJs()
     */
    waitForJs(): void;
  }
}
