describe("External fields", () => {
  it("should focus the first invalid field even if it's outside the form", () => {
    cy.visit("/validation-external");
    cy.findByText("Submit").click();
    cy.findByText("Text 1 is a required field").should("exist");
    cy.findByLabelText("Text 1").should("be.focused");
  });

  it("should populate default values on external fields", () => {
    cy.visit("/default-values-external");
    cy.findByLabelText("Text 1").should("have.value", "John");
    cy.findByLabelText("Text 2").should("have.value", "Bob");
  });

  it("should not populate default values on external fields without JS", () => {
    cy.visitWithoutJs("/default-values-external");
    cy.findByLabelText("Text 1").should("have.value", "");
    cy.findByLabelText("Text 2").should("have.value", "Bob");
  });
});
