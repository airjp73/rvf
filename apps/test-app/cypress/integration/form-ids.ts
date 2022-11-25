describe("Form ids", () => {
  it("should include the form id in the request and return it form the validator", () => {
    cy.visit("/form-id").waitForJs();
    cy.findByText("Submit").click();
    cy.findByText("Form has id: form-id-test-form").should("exist");
  });
});
