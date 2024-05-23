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
  cy.findByTestId(id)
    .findByText("fieldErrors")
    .next()
    .should("contain.text", JSON.stringify(values.fieldErrors));
  cy.findByTestId(id)
    .findByText("defaultValues")
    .next()
    .should("contain.text", JSON.stringify(values.defaultValues));
  cy.findByTestId(id)
    .findByText("touchedFields")
    .next()
    .should("contain.text", JSON.stringify(values.touchedFields));
  cy.findByTestId(id)
    .findByText("getValues")
    .next()
    .should("contain.text", JSON.stringify(values.getValues));
};
const expectAllValues = (values: any) => {
  expectValues("external-values", values);
  expectValues("internal-values", values);
};

describe("Context hooks", () => {
  it("should return the correct values", () => {
    cy.visit("/context-hooks").waitForJs();
    expectAllValues({
      isValid: true,
      hasBeenSubmitted: false,
      action: "/context-hooks",
      fieldErrors: {},
      touchedFields: {},
      defaultValues: { firstName: "defaultFirstName" },
      getValues: {
        firstName: "defaultFirstName",
      },
    });

    cy.findByLabelText("First Name").clear().blur();
    expectAllValues({
      isValid: false,
      hasBeenSubmitted: false,
      action: "/context-hooks",
      fieldErrors: { firstName: "First Name is a required field" },
      touchedFields: { firstName: true },
      defaultValues: { firstName: "defaultFirstName" },
      getValues: { firstName: "" },
    });

    cy.findByText("Submit").click();
    expectAllValues({
      isValid: false,
      hasBeenSubmitted: true,
      action: "/context-hooks",
      fieldErrors: { firstName: "First Name is a required field" },
      touchedFields: { firstName: true },
      defaultValues: { firstName: "defaultFirstName" },
      getValues: { firstName: "" },
    });

    cy.findByLabelText("First Name").type("something");
    expectAllValues({
      isValid: true,
      hasBeenSubmitted: true,
      action: "/context-hooks",
      fieldErrors: {},
      touchedFields: { firstName: true },
      defaultValues: { firstName: "defaultFirstName" },
      getValues: { firstName: "something" },
    });

    cy.findByText("Submit").click();
    expectAllValues({
      isValid: true,
      hasBeenSubmitted: true,
      action: "/context-hooks",
      fieldErrors: {},
      touchedFields: { firstName: true },
      defaultValues: { firstName: "defaultFirstName" },
      getValues: {
        firstName: "something",
      },
    });
  });
});
