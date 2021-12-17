describe("Validation", () => {
  it("should show the loading state for the correct submit button", () => {
    cy.visit("/submission");
    cy.findByText("Submit main form").click();
    cy.findByText("Submitting alt form").should("not.exist");
    cy.findByText("Submitting fetcher form").should("not.exist");
    // if we check the one we're expecting last, then the test will correctly fail if the other buttons are in a loading state
    cy.findByText("Submitting main form").should("exist");

    cy.findByText("Submitting main form").should("not.exist");

    cy.findByText("Submit alt form").click();
    cy.findByText("Submitting main form").should("not.exist");
    cy.findByText("Submitting fetcher form").should("not.exist");
    cy.findByText("Submitting alt form").should("exist");

    cy.findByText("Submitting alt form").should("not.exist");

    cy.findByText("Submit fetcher form").click();
    cy.findByText("Submitting alt form").should("not.exist");
    cy.findByText("Submitting main form").should("not.exist");
    cy.findByText("Submitting fetcher form").should("exist");

    cy.findByText("Submitting fetcher form").should("not.exist");
  });

  it("should show the loading state for the correct submit button when using subactions", () => {
    cy.visit("/submission/subactions");
    cy.findByText("Submit form 1").click();
    cy.findByText("Submitting form 2").should("not.exist");
    cy.findByText("Submitting form 3").should("not.exist");
    // if we check the one we're expecting last, then the test will correctly fail if the other buttons are in a loading state
    cy.findByText("Submitting form 1").should("exist");

    cy.findByText("Submitting form 1").should("not.exist");
    cy.findByText("Submitted form 1").should("exist");

    cy.findByText("Submit form 2").click();
    cy.findByText("Submitting form 1").should("not.exist");
    cy.findByText("Submitting form 3").should("not.exist");
    cy.findByText("Submitting form 2").should("exist");

    cy.findByText("Submitting form 2").should("not.exist");
    cy.findByText("Submitted form 2").should("exist");

    cy.findByText("Submit form 3").click();
    cy.findByText("Submitting form 2").should("not.exist");
    cy.findByText("Submitting form 1").should("not.exist");
    cy.findByText("Submitting form 3").should("exist");

    cy.findByText("Submitting form 3").should("not.exist");
    cy.findByText("Submitted form 3").should("exist");
  });
});
