/**
 * You shouldn't normally care that much about render count,
 * but we also shouldn't render on every keystroke
 * when the validation type is `onChange`.
 */
describe("Rerenders", () => {
  it("should only update when the validation state is different, not on every validate call", () => {
    cy.visit("/rerenders").waitForJs();

    // Put ourselves in onChange mode and reset the render count
    cy.findByLabelText("First Name").focus().blur();
    cy.findByLabelText("Email").focus().blur();
    cy.findByText("Reset render count").click();

    cy.findByText("First Name is a required field").should("exist");

    // Error gone -> error back -> error gone -> error back
    cy.findByLabelText("First Name").type("a{backspace}a{backspace}");

    cy.findByTestId("render-count").should("have.text", "4");
    cy.findByText("Reset render count").click();

    // Change to valid after 1 keystroke, then back to invalid after 9 more keystrokes
    cy.findByLabelText("First Name").type(
      "hello{backspace}{backspace}{backspace}{backspace}{backspace}"
    );
    cy.findByTestId("render-count").should("have.text", "2");
    cy.findByText("Reset render count").click();

    // Email will spend some time invalid even while typing
    cy.findByLabelText("Email").type("testing@example.com");
    // Changes from "required" to "invalid email" then to valid
    cy.findByTestId("render-count").should("have.text", "4");
  });
});
