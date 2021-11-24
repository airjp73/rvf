describe("Validation", () => {
  describe("Frontend validation", () => {
    it("should support validating individual fields", () => {
      cy.visit("/field-validation");

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
      cy.findByLabelText("Email").blur();
      cy.findByText("Email must be a valid email").should("exist");

      cy.findByLabelText("Email").clear().type("an.email@example.com").blur();
      cy.findByText("Email must be a valid email").should("not.exist");

      cy.findByText("Email is a required field").should("not.exist");
      cy.findByText("Last Name is a required field").should("not.exist");
      cy.findByText("First Name is a required field").should("not.exist");

      cy.findByText("Submit").click();
      cy.findByText("Submitted!").should("exist");
    });
  });
});
