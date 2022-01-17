describe("Checkboxes", () => {
  it("should handle multiple checkboxes with the same name", () => {
    cy.visit("/checkboxes");

    cy.findByText("Submit").click();
    cy.findByText("likes is a required field");

    cy.findByLabelText("Pizza").click();

    cy.findByText("Submit").click();
    cy.findByText("You like pizza").should("exist");

    cy.findByLabelText("Cheese").click();
    cy.findByLabelText("Mushrooms").click();
    cy.findByLabelText("Pepperoni").click();

    cy.findByText("Submit").click();
    cy.findByText("You like pizza, mushrooms, cheese, pepperoni").should(
      "exist"
    );
  });
});
