describe("Validation", () => {
  it("should support validating individual fields", () => {
    cy.visit("/validation").waitForJs();

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

    cy.findByLabelText("Comment").focus().blur();
    cy.findByText("Comment is a required field").should("exist");
    cy.findByLabelText("Comment").type("Some comment");
    cy.findByText("Comment is a required field").should("not.exist");

    cy.findByText("Email is a required field").should("not.exist");
    cy.findByText("Last Name is a required field").should("not.exist");
    cy.findByText("First Name is a required field").should("not.exist");
    cy.findByText("Name of a contact is a required field").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });

  it("should validate the whole form at once when submit clicked", () => {
    cy.visit("/validation").waitForJs();

    cy.findByText("Submit").click();

    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Name of a contact is a required field").should("exist");
    cy.findByText("Comment is a required field").should("exist");
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

    cy.findByLabelText("Comment").type("Some comment");
    cy.findByText("Comment is a required field").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByLabelText("Name of a contact").should("be.focused");

    cy.findByLabelText("Name of a contact").type("Someone else");
    cy.findByText("Name of a contact is a required field").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByText("Submitted for John Doe!").should("exist");
  });

  it("should use native validation api when using useNativeValidityForForm", () => {
    cy.visit("/validation-native").waitForJs();
    cy.findByText("Submit").click();

    cy.findByLabelText("First Name")
      .invoke("prop", "validationMessage")
      .should("equal", "First Name is a required field");
    cy.findByLabelText("Last Name")
      .invoke("prop", "validationMessage")
      .should("equal", "Last Name is a required field");
    cy.findByLabelText("Email")
      .invoke("prop", "validationMessage")
      .should("equal", "Email is a required field");
    cy.findByLabelText("Name of a contact")
      .invoke("prop", "validationMessage")
      .should("equal", "Name of a contact is a required field");
    cy.findByLabelText("Comment")
      .invoke("prop", "validationMessage")
      .should("equal", "Comment is a required field");
  });

  it("should reset isValid to true when errors resolved", () => {
    cy.visit("/validation-isvalid").waitForJs();

    cy.findByText("Submit").click();

    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Submit").should("be.disabled");
    cy.findByLabelText("First Name").should("be.focused").type("John");
    cy.findByText("Submit").should("be.enabled");
  });

  it("should focus the first invalid field", () => {
    cy.visit("/validation").waitForJs();

    cy.findByText("Submit").click();

    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Name of a contact is a required field").should("exist");
    cy.findByText("Comment is a required field").should("exist");
    cy.findByLabelText("First Name").should("be.focused");
  });

  it("should focus the first invalid textarea if that is the first invalid field", () => {
    cy.visit("/validation-textarea").waitForJs();
    cy.findByText("Submit").click();
    cy.findByLabelText("Long Text").should("be.focused");
  });

  it("should focus the selected radio if that is the first invalid field", () => {
    cy.visit("/validation-radio").waitForJs();
    cy.findByText("Submit").click();
    cy.findByTestId("expected").should("be.focused");
  });

  it("should not focus the first invalid field if disableFocusOnError is true", () => {
    cy.visit("/validation-nofocus").waitForJs();

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

  it("should support focusing refs of controlled fields", () => {
    cy.visit("/validation-focus-custom").waitForJs();

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
    cy.findByText("Comment is a required field").should("exist");

    cy.findByLabelText("First Name").type("John");
    cy.findByLabelText("Last Name").type("Doe");
    cy.findByLabelText("Email").type("an.email@example.com");
    cy.findByLabelText("Name of a contact").type("Someone else");
    cy.findByLabelText("Comment").type("Some comment");

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
    cy.findByLabelText("Comment").type("Some comment");

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
    cy.visit("/validation").waitForJs();

    cy.findByText("Submit").click();

    cy.findByText("Email is a required field").should("exist");
    cy.findByText("Last Name is a required field").should("exist");
    cy.findByText("First Name is a required field").should("exist");
    cy.findByText("Name of a contact is a required field").should("exist");
    cy.findByText("Comment is a required field").should("exist");

    // sometimes there's a weird race condition where the blur runs after the click
    cy.focused().blur();
    cy.findByText("Reset").click();

    cy.findByText("Email is a required field").should("not.exist");
    cy.findByText("Last Name is a required field").should("not.exist");
    cy.findByText("First Name is a required field").should("not.exist");
    cy.findByText("Name of a contact is a required field").should("not.exist");
    cy.findByText("Comment is a required field").should("not.exist");
  });

  it("should show errors for forms with form ids and clear them upon navigating away", () => {
    cy.visit("form-id-validation").waitForJs();

    cy.findByText("Submit").click();
    cy.findByText("Required").should("exist");

    cy.findByText("Other").click();
    cy.findByText("Form").click();

    cy.findByText("Test input").should("exist");
    cy.findByText("Required").should("not.exist");
  });

  it("should return validation result from validate helper and show errors", () => {
    cy.visit("validation-helper").waitForJs();

    cy.findByText("Submit with helper").click();

    // Form-level message we set manually when validate returns error
    cy.findByText("Invalid").should("exist");

    // Field-level message should be auto-populated
    cy.findByText("Must be checked").should("exist");

    cy.findByLabelText("isValid").click();
    cy.findByText("Submit with helper").click();

    cy.findByText("Submitted!").should("exist");
  });

  it("should focus the first invalid field from custom validation", () => {
    cy.visit("/custom-server-validation-focus-invalid-field").waitForJs();

    cy.findByText("Submit").click();

    cy.findByText("Error").should("exist");
    cy.findByLabelText("First Name").should("not.be.focused");
    cy.findByLabelText("Last Name").should("be.focused");
  });

  it("should not focus the first invalid field from custom validation if disableFocusOnError is true", () => {
    cy.visit(
      "/custom-server-validation-disable-focus-invalid-field",
    ).waitForJs();

    cy.findByText("Submit").click();

    cy.findByText("Error").should("exist");
    cy.findByLabelText("First Name").should("not.be.focused");
    cy.findByLabelText("Last Name").should("not.be.focused");
  });

  it("should support dependant validation", () => {
    cy.visit("validation-dependant").waitForJs();

    cy.findByLabelText("Is required").click();
    cy.findByText("First name is a required field").should("not.exist");

    cy.findByLabelText("First name").type("John").clear().blur();
    cy.findByText("First name is a required field").should("exist");

    cy.findByLabelText("Is required").click();
    cy.findByText("First name is a required field").should("not.exist");

    cy.findByLabelText("Is required").click();
    cy.findByText("First name is a required field").should("exist");
  });
});
