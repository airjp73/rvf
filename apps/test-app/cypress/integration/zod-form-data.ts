describe("zod-form-data", () => {
  it("should work correctly full stack", () => {
    cy.visit("/zod-form-data?name=Jimbob&count=4").waitForJs();

    cy.findByText("Welcome, Jimbob. You're visitor number 4!").should("exist");

    cy.findByLabelText("First Name").focus().blur();
    cy.findByText("First Name is a required field").should("exist");
    cy.findByLabelText("First Name").type("John");
    cy.findByText("First Name is a required field").should("not.exist");

    cy.findByLabelText("Last Name").focus().blur();
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByLabelText("Last Name").type("Doe");
    cy.findByText("Last Name is a required field").should("not.exist");

    cy.findByLabelText("Email").type("not an email").blur();
    cy.findByText("Email must be a valid email").should("exist");

    cy.findByLabelText("Name of a contact").focus().blur();
    cy.findByText("Name of a contact is a required field").should("exist");
    cy.findByLabelText("Name of a contact").type("Someone else");
    cy.findByText("Name of a contact is a required field").should("not.exist");

    cy.findByLabelText("Email").clear().type("an.email@example.com");
    cy.findByText("Email must be a valid email").should("not.exist");

    cy.findByText("Email is a required field").should("not.exist");
    cy.findByText("Last Name is a required field").should("not.exist");
    cy.findByText("First Name is a required field").should("not.exist");
    cy.findByText("Name of a contact is a required field").should("not.exist");

    cy.findByLabelText("Wednesday").click();

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });
});
