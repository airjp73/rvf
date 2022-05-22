describe("Validation", () => {
  it("should support validating individual fields", () => {
    cy.visit("/validation");

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

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });

  it("should validate the whole form at once when submit clicked", () => {
    cy.visit("/validation");

    cy.findByText("Submit").click();

    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Name of a contact is a required field").should("exist");
    cy.findByLabelText("First Name").should("be.focused");

    cy.findByLabelText("First Name").type("John");
    cy.findByText("First Name is a required field").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByLabelText("Last Name").should("be.focused");

    cy.findByLabelText("Last Name").type("Doe");
    cy.findByText("Last Name is a required field").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByLabelText("Email").should("be.focused");

    cy.findByLabelText("Email").type("an.email@example.com");
    cy.findByText("Email is a required field").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByLabelText("Name of a contact").should("be.focused");

    cy.findByLabelText("Name of a contact").type("Someone else");
    cy.findByText("Name of a contact is a required field").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });

  it("should reset isValid to true when errors resolved", () => {
    cy.visit("/validation-isvalid");

    cy.findByText("Submit").click();

    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Submit").should("be.disabled");
    cy.findByLabelText("First Name").should("be.focused").type("John");
    cy.findByText("Submit").should("be.enabled");
  });

  it("should focus the first invalid field", () => {
    cy.visit("/validation");

    cy.findByText("Submit").click();

    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Name of a contact is a required field").should("exist");
    cy.findByLabelText("First Name").should("be.focused");
  });

  it("should focus the selected radio if that is the first invalid field", () => {
    cy.visit("/validation-radio");
    cy.findByText("Submit").click();
    cy.findByTestId("expected").should("be.focused");
  });

  it("should not focus the first invalid field if disableFocusOnError is true", () => {
    cy.visit("/validation-nofocus");

    cy.findByText("Submit").click();

    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Name of a contact is a required field").should("exist");
    cy.findByLabelText("First Name").should("not.be.focused");
    cy.findByLabelText("Last Name").should("not.be.focused");
    cy.findByLabelText("Email").should("not.be.focused");
    cy.findByLabelText("Name of a contact").should("not.be.focused");
  });

  it("should support custom recieveFocus handlers", () => {
    cy.visit("/validation-focus-custom");

    cy.findByText("Submit").click();
    cy.findByLabelText("Something").should("be.focused");

    cy.findByLabelText("Something").type("Something");
    cy.findByText("Submit").click();
    cy.findByTestId("custom").should("be.focused");
  });

  it("should show validation errors even with JS disabled", () => {
    cy.visitWithoutJs("/validation");

    cy.findByText("Submit").click();

    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Name of a contact is a required field").should("exist");

    cy.findByLabelText("First Name").type("John");
    cy.findByLabelText("Last Name").type("Doe");
    cy.findByLabelText("Email").type("an.email@example.com");
    cy.findByLabelText("Name of a contact").type("Someone else");

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });

  it("should support repopulating field values when showing validation errors without JS", () => {
    cy.visitWithoutJs("/validation");

    cy.findByLabelText("First Name").type("John");
    cy.findByLabelText("Last Name").type("Doe");
    cy.findByLabelText("Likes pizza").click();
    cy.findByText("Submit").click();

    cy.findByText("First Name is a required field").should("not.exist");
    cy.findByText("Last Name is a required field").should("not.exist");
    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Name of a contact is a required field").should("exist");

    cy.findByLabelText("First Name").should("have.value", "John");
    cy.findByLabelText("Last Name").should("have.value", "Doe");
    cy.findByLabelText("Likes pizza").should("be.checked");

    cy.findByLabelText("Email").type("an.email@example.com");
    cy.findByLabelText("Name of a contact").type("Someone else");

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });

  it("should support repopulating field values when showing custom validation", () => {
    cy.visitWithoutJs("/custom-server-validation");

    cy.findByText("Submit").click();

    cy.findByText("Error").should("exist");
    cy.findByText("Error 2").should("exist");
    cy.findByLabelText("First Name").should("have.value", "Bob");
    cy.findByLabelText("Last Name").should("have.value", "Ross");
  });

  it("should reset validation errors when resetting the form", () => {
    cy.visit("/validation");

    cy.findByText("Submit").click();

    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Name of a contact is a required field").should("exist");

    cy.findByText("Reset").click();

    cy.findByText("Email is a required field").should("not.exist");
    cy.findByText("Last Name is a required field").should("not.exist");
    cy.findByText("First Name is a required field").should("not.exist");
    cy.findByText("Name of a contact is a required field").should("not.exist");
  });

  it("should show errors for forms with form ids and clear them upon navigating away", () => {
    cy.visit("form-id-validation");

    cy.findByText("Submit").click();
    cy.findByText("Required").should("exist");

    cy.findByText("Other").click();
    cy.findByText("Form").click();

    cy.findByText("Test input").should("exist");
    cy.findByText("Required").should("not.exist");
  });

  it("should return validation result from validate helper and show errors", () => {
    cy.visit("validation-helper");

    cy.findByText("Submit with helper").click();

    // Form-level message we set manually when validate returns error
    cy.findByText("Invalid").should("exist");

    // Field-level message should be auto-populated
    cy.findByText("Must be checked").should("exist");

    cy.findByLabelText("isValid").click();
    cy.findByText("Submit with helper").click();

    cy.findByText("Submitted!").should("exist");
  });
});
