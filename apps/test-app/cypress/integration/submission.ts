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

  it("should reset when the form has been successfully submitted when resetAfterSubmit", () => {
    cy.visit("/submission/aftersubmit");

    cy.findByLabelText("Test input").type("fail");
    cy.findByText("Submit").click();
    cy.findByText("Don't say that").should("exist");
    cy.findByLabelText("Test input").should("have.value", "fail");

    cy.findByLabelText("Test input").clear().type("testing");
    cy.findByLabelText("Another input").type("something");
    cy.findByText("Submit").click();
    cy.findByLabelText("Test input").should("have.value", "");
    cy.findByLabelText("Another input").should("have.value", "something"); // shouldn't reset this one
  });

  it("should not reset when the form has been successfully submitted when not resetAfterSubmit", () => {
    cy.visit("/submission/notaftersubmit");

    cy.findByLabelText("Test input").type("noreset");
    cy.findByText("Submit").click();
    cy.findByLabelText("Test input").should("have.value", "noreset");
  });

  it("should track whether or not submission has been attempted", () => {
    cy.visit("/submission/hasbeensubmitted");
    cy.findByText("Submitted!").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByText("Submitted!").should("exist");
    cy.findByText("First Name is a required field").should("exist");

    cy.findByText("Reset").click();
    cy.findByText("Submitted!").should("not.exist");
  });

  it("should include submit button value when external", () => {
    cy.visit("/submission/external");
    cy.findByText("Submitted submitVal").should("not.exist");

    cy.findByText("Submit").click();
    cy.findByText("Submitting...").should("exist");
    cy.findByText("Submit").should("exist");
    cy.findByText("Submitted submitVal").should("exist");
  });

  it("should include submit button value when internal", () => {
    cy.visit("/submission/external");
    cy.findByText("Submitted internalVal").should("not.exist");

    cy.findByText("Submit 2").click();
    cy.findByText("Submitting 2").should("exist");
    cy.findByText("Submit 2").should("exist");
    cy.findByText("Submitted internalVal").should("exist");
  });
});
