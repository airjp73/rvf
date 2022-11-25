describe("Async Validation", () => {
  it("should support async validation", () => {
    cy.visit("/validation-async").waitForJs();

    cy.findByLabelText("First Name").focus().blur();
    cy.findByText("First Name is a required field").should("exist");
    cy.findByLabelText("First Name").type("John");
    cy.findByText("First Name is a required field").should("not.exist");

    cy.findByLabelText("Last Name").focus().blur();
    cy.findByText("Last Name is a required field").should("exist");

    cy.findByLabelText("Last Name").type("John");
    cy.findByText("First Name and Last Name must be different").should("exist");

    cy.findByText("Submit").click();
    cy.findByText("Submitting...").should("exist");
    cy.findByText("Submit").should("be.enabled");
    cy.findByLabelText("Last Name").clear().type("Doe");

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });
});
