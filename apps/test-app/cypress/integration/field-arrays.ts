describe("Field arrays", () => {
  it("should add and remove items", () => {
    cy.visit("/field-array");

    // Default values
    cy.findByTestId("todo-0")
      .findByLabelText("Title")
      .should("have.value", "Default 1");
    cy.findByTestId("todo-0")
      .findByLabelText("Notes")
      .should("have.value", "Default note 1");

    cy.findByTestId("todo-1")
      .findByLabelText("Title")
      .should("have.value", "Default 2");
    cy.findByTestId("todo-1")
      .findByLabelText("Notes")
      .should("have.value", "Default note 2");

    cy.findAllByTestId("todo-id").should("have.length", 2);

    // Add a new todo and type
    cy.findByText("Add todo").click();

    cy.findByTestId("todo-2").findByLabelText("Title").should("have.value", "");
    cy.findByTestId("todo-2").findByLabelText("Notes").should("have.value", "");
    cy.findAllByTestId("todo-id").should("have.length", 3);

    cy.findByTestId("todo-2").findByLabelText("Title").type("Test 1");

    // Delete the first todo
    cy.findByTestId("todo-0").findByText("Delete todo").click();

    cy.findByTestId("todo-0")
      .findByLabelText("Title")
      .should("have.value", "Default 2");
    cy.findByTestId("todo-0")
      .findByLabelText("Notes")
      .should("have.value", "Default note 2");

    cy.findByTestId("todo-1")
      .findByLabelText("Title")
      .should("have.value", "Test 1");
    cy.findByTestId("todo-1").findByLabelText("Notes").should("have.value", "");

    cy.findAllByTestId("todo-id").should("have.length", 2);

    // Delete the last todo
    cy.findByTestId("todo-1").findByText("Delete todo").click();

    cy.findByTestId("todo-0")
      .findByLabelText("Title")
      .should("have.value", "Default 2");
    cy.findByTestId("todo-0")
      .findByLabelText("Notes")
      .should("have.value", "Default note 2");

    cy.findAllByTestId("todo-id").should("have.length", 1);
  });

  it("should work without any default value", () => {
    cy.visit("/field-array/no-defaults");

    // Initially empty
    cy.findAllByTestId("todo-id").should("have.length", 0);

    // Add a new todo and type
    cy.findByText("Add todo").click();
    cy.findByTestId("todo-0").findByLabelText("Title").should("have.value", "");
    cy.findByTestId("todo-0").findByLabelText("Notes").should("have.value", "");
    cy.findAllByTestId("todo-id").should("have.length", 1);

    // Delete the todo
    cy.findByTestId("todo-0").findByText("Delete todo").click();
    cy.findAllByTestId("todo-id").should("have.length", 0);
  });

  it("should work with controlled inputs", () => {
    cy.visit("/field-array/controlled");

    // Default values
    cy.findByTestId("todo-0")
      .findByLabelText("Title")
      .should("have.value", "Default 1");
    cy.findByTestId("todo-0")
      .findByLabelText("Notes")
      .should("have.value", "Default note 1");

    cy.findByTestId("todo-1")
      .findByLabelText("Title")
      .should("have.value", "Default 2");
    cy.findByTestId("todo-1")
      .findByLabelText("Notes")
      .should("have.value", "Default note 2");

    cy.findAllByTestId("todo-id").should("have.length", 2);

    // Add a new todo and type
    cy.findByText("Add todo").click();

    cy.findByTestId("todo-2").findByLabelText("Title").should("have.value", "");
    cy.findByTestId("todo-2").findByLabelText("Notes").should("have.value", "");
    cy.findAllByTestId("todo-id").should("have.length", 3);

    cy.findByTestId("todo-2").findByLabelText("Title").type("Test 1");

    // Delete the first todo
    cy.findByTestId("todo-0").findByText("Delete todo").click();

    cy.findByTestId("todo-0")
      .findByLabelText("Title")
      .should("have.value", "Default 2");
    cy.findByTestId("todo-0")
      .findByLabelText("Notes")
      .should("have.value", "Default note 2");

    cy.findByTestId("todo-1")
      .findByLabelText("Title")
      .should("have.value", "Test 1");
    cy.findByTestId("todo-1").findByLabelText("Notes").should("have.value", "");

    cy.findAllByTestId("todo-id").should("have.length", 2);

    // Delete the last todo
    cy.findByTestId("todo-1").findByText("Delete todo").click();

    cy.findByTestId("todo-0")
      .findByLabelText("Title")
      .should("have.value", "Default 2");
    cy.findByTestId("todo-0")
      .findByLabelText("Notes")
      .should("have.value", "Default note 2");

    cy.findAllByTestId("todo-id").should("have.length", 1);
  });
});
