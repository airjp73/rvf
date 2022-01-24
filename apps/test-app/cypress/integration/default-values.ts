describe("Validation", () => {
  it("should propagate default values to inputs", () => {
    cy.visit("/default-values");
    cy.findByLabelText("First Name").should("have.value", "Jane");
    cy.findByLabelText("Last Name").should("have.value", "Doe");
    cy.findByLabelText("Email").should("have.value", "jane.doe@example.com");
    cy.findByLabelText("Age").should("have.value", "26");
    cy.findByLabelText("Likes Pizza").should("be.checked");
    // Label text seems to grab the wrong input for some reason
    cy.findByTestId("cake").should("be.checked");
    cy.findByTestId("iceCream").should("not.be.checked");
  });

  it("should propagate default values to inputs without JS", () => {
    cy.visitWithoutJs("/default-values");
    cy.findByLabelText("First Name").should("have.value", "Jane");
    cy.findByLabelText("Last Name").should("have.value", "Doe");
    cy.findByLabelText("Email").should("have.value", "jane.doe@example.com");
    cy.findByLabelText("Age").should("have.value", "26");
    cy.findByLabelText("Likes Pizza").should("be.checked");
    cy.findByTestId("cake").should("be.checked");
    cy.findByTestId("iceCream").should("not.be.checked");
  });
});
