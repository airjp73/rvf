describe("Validation with fetchers", () => {
  it("should support validating individual fields", () => {
    cy.visit("/validation-fetcher").waitForJs();

    cy.findByLabelText("First Name").focus().blur();
    cy.findByText("First Name is a required field").should("exist");
    cy.findByLabelText("First Name").type("John");
    cy.findByText("First Name is a required field").should("not.exist");

    cy.findByLabelText("Last Name").focus().blur();
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByLabelText("Last Name").type("Doe");
    cy.findByText("Last Name is a required field").should("not.exist");

    cy.findByLabelText("Email").focus().blur();
    cy.findByText("Email is a required field").should("exist");
    cy.findByLabelText("Email").type("not an email");
    cy.findByText("Email must be a valid email").should("exist");

    cy.findByLabelText("Email").clear().type("an.email@example.com");
    cy.findByText("Email must be a valid email").should("not.exist");

    cy.findByText("Email is a required field").should("not.exist");
    cy.findByText("Last Name is a required field").should("not.exist");
    cy.findByText("First Name is a required field").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });

  it("should validate the whole form at once when submit clicked", () => {
    cy.visit("/validation-fetcher").waitForJs();

    cy.findByText("Submit").click();

    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByText("First Name is a required field").should("exist");

    cy.findByLabelText("First Name").type("John");
    cy.findByText("First Name is a required field").should("not.exist");

    cy.findByLabelText("Last Name").type("Doe");
    cy.findByText("Last Name is a required field").should("not.exist");

    cy.findByLabelText("Email").type("an.email@example.com");
    cy.findByText("Email is a required field").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });
});
