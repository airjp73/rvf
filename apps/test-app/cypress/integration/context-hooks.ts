const expectValues = (id: string, values: any) => {
  cy.findByTestId(id)
    .findByText("hasBeenSubmitted")
    .next()
    .should("contain.text", values.hasBeenSubmitted);
  cy.findByTestId(id)
    .findByText("isValid")
    .next()
    .should("contain.text", values.isValid);
  cy.findByTestId(id)
    .findByText("action")
    .next()
    .should("contain.text", values.action);
};
const expectAllValues = (values: any) => {
  expectValues("external-values", values);
  expectValues("internal-values", values);
};
describe("Context hooks", () => {
  it("should return the correct values", () => {
    cy.visit("/context-hooks");
    expectAllValues({
      isValid: true,
      hasBeenSubmitted: false,
      action: "/context-hooks",
    });

    cy.findByText("Submit").click();
    expectAllValues({
      isValid: false,
      hasBeenSubmitted: true,
      action: "/context-hooks",
    });

    cy.findByLabelText("First Name").type("something");
    expectAllValues({
      isValid: true,
      hasBeenSubmitted: true,
      action: "/context-hooks",
    });

    cy.findByText("Submit").click();
    expectAllValues({
      isValid: true,
      hasBeenSubmitted: true,
      action: "/context-hooks",
    });
  });
});
