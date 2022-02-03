describe("Async Validation", () => {
  it("should support async validation", () => {
    cy.visit("/validation-async");

    cy.findByLabelText("First Name").focus().blur();
    cy.findByText("First Name is a required field").should("exist");
    cy.findByLabelText("First Name").type("John");
    cy.findByText("First Name is a required field").should("not.exist");

    cy.findByLabelText("Last Name").focus().blur();
    cy.findByText("Validating...").should("not.exist");
    cy.findByText("Last Name is a required field").should("exist");

    cy.findByLabelText("Last Name").type("John");
    cy.findByText("Validating...").should("exist");
    cy.findByText("First Name and Last Name must be different").should("exist");
    cy.findByLabelText("Last Name").clear().type("Doe");

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });
});
