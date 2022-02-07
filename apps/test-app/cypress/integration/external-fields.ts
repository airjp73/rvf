describe("External fields", () => {
  it("should focus the first invalid field even if it's outside the form", () => {
    cy.visit("/validation-external");
    cy.findByText("Submit").click();
    cy.findByText("Text 1 is a required field").should("exist");
    cy.findByLabelText("Text 1").should("be.focused");
  });
});
