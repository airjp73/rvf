describe("Validation", () => {
  it("should propagate default values to inputs", () => {
    cy.visit("/default-values");
    cy.findByLabelText("First Name").should("have.value", "Jane");
    cy.findByLabelText("Last Name").should("have.value", "Doe");
    cy.findByLabelText("Email").should("have.value", "jane.doe@example.com");
    cy.findByLabelText("Age").should("have.value", "26");
  });

  it("should propagate default values to inputs without JS", () => {
    cy.visitWithoutJs("/default-values");
    cy.findByLabelText("First Name").should("have.value", "Jane");
    cy.findByLabelText("Last Name").should("have.value", "Doe");
    cy.findByLabelText("Email").should("have.value", "jane.doe@example.com");
    cy.findByLabelText("Age").should("have.value", "26");
  });
});
