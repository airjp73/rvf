describe("Controlled fields", () => {
  it("should store the value and submit it correctly", () => {
    cy.visit("/controlled-field");

    cy.findByTestId("green").should("have.text", "Green (selected)");
    cy.findByTestId("blue")
      .should("have.text", "Blue")
      .click()
      .should("have.text", "Blue (selected)");
    cy.findByTestId("green").should("have.text", "Green");

    cy.findByTestId("text-input").type("bob");

    cy.findByText("Submit").click();
    cy.findByText("Color chosen is blue").should("exist");
  });

  it("should correctly unregsiter when no instances of the field are present", () => {
    cy.visit("/controlled-field");

    cy.findByTestId("blue").click().should("have.text", "Blue (selected)");

    cy.findByText("+").click().click().click();
    cy.findByText("-").click().click().click();

    cy.findByTestId("blue").should("have.text", "Blue (selected)");

    cy.findByText("-").click();
    cy.findByText("+").click();
    cy.findByTestId("blue").should("have.text", "Blue");
    cy.findByTestId("green").should("have.text", "Green (selected)");
  });

  it("should show validation errors", () => {
    cy.visit("/controlled-field");
    cy.findByText("Submit").click();
    cy.findByTestId("error").should("exist");
    cy.findByTestId("text-error").should("exist");
  });

  it("should validate against the correct value and resolve all promises along theway", () => {
    cy.visit("/controlled-field");
    cy.findByTestId("text-input").type("some test text");
    cy.findByText("Expected bob, received some test text").should("exist");
    cy.findByTestId("resolution-count").should("have.text", "14");
  });
});
