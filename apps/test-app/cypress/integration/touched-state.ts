describe("Touched state", () => {
  it("should track touched state and reset when the form is reset", () => {
    cy.visit("/touched-state").waitForJs();

    cy.findByText("firstName touched").should("not.exist");
    cy.findByText("lastName touched").should("not.exist");

    cy.findByLabelText("First Name").focus().blur();
    cy.findByText("firstName touched").should("exist");
    cy.findByText("lastName touched").should("not.exist");

    cy.findByLabelText("Last Name").focus().blur();
    cy.findByText("firstName touched").should("exist");
    cy.findByText("lastName touched").should("exist");

    cy.findByText("Reset").click();

    cy.findByText("firstName touched").should("not.exist");
    cy.findByText("lastName touched").should("not.exist");
  });
});
