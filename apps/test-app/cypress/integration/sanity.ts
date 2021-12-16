/**
 * Some tests just to verify that the test utils in the app actually behave as assumed by other tests
 */

describe("Sanity", () => {
  describe("Visiting without JS", () => {
    it("should not show a noscript message when javascript enabled", () => {
      cy.visit("/noscript");
      cy.findByText("Is JS turned on?").should("exist");
      cy.findByText("JS is turned off").should("not.exist");
    });

    it("should show a noscript message when javascript disabled", () => {
      cy.visitWithoutJs("/noscript");
      cy.findByText("Is JS turned on?").should("exist");
      cy.findByText("JS is turned off").should("exist");
    });

    it("should work with js even after a non-js test has been run", () => {
      cy.visit("/noscript");
      cy.findByText("Is JS turned on?").should("exist");
      cy.findByText("JS is turned off").should("not.exist");
    });
  });
});
