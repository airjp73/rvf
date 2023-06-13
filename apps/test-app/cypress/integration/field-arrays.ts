describe("Field arrays", () => {
  it("should show default values even without js", () => {
    cy.visitWithoutJs("/field-array");

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

    cy.findByTestId("todo-2")
      .findByLabelText("Title")
      .should("have.value", "Default 3");
    cy.findByTestId("todo-2")
      .findByLabelText("Notes")
      .should("have.value", "Default note 3");

    cy.findAllByTestId("todo-id").should("have.length", 3);
  });

  it("should work without any default value", () => {
    cy.visit("/field-array/no-defaults").waitForJs();

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

  it("should sumbit the data correctly", () => {
    cy.visit("/field-array/no-defaults").waitForJs();

    cy.findByText("Add todo").click();
    cy.findByTestId("todo-0").findByLabelText("Title").type("Todo 1");
    cy.findByTestId("todo-0").findByLabelText("Notes").type("Do something");

    cy.findByText("Add todo").click();
    cy.findByTestId("todo-1").findByLabelText("Title").type("Todo 2");
    cy.findByTestId("todo-1")
      .findByLabelText("Notes")
      .type("Do something else");

    cy.findByText("Add todo").click();
    cy.findByTestId("todo-2").findByLabelText("Title").type("Todo 3");
    cy.findByTestId("todo-2")
      .findByLabelText("Notes")
      .type("This one gets deleted");

    cy.findByText("Add todo").click();
    cy.findByTestId("todo-3").findByLabelText("Title").type("Todo 4");
    cy.findByTestId("todo-3").findByLabelText("Notes").type("With a vengeance");

    cy.findByTestId("todo-2").findByText("Delete todo").click();
    cy.findByText("Submit").click();

    cy.findByText("Submitted!").should("exist");
    cy.findByText("Todo 1: Do something").should("exist");
    cy.findByText("Todo 2: Do something else").should("exist");
    cy.findByText("Todo 4: With a vengeance").should("exist");
    cy.findAllByTestId("submitted-todo").should("have.length", 3);

    cy.findByText("Todo 3: This one gets deleted").should("not.exist");
  });

  it("should maintain state correctly", () => {
    cy.visit("/field-array/state");

    cy.findByText("Push").click();
    cy.findByText("Push").click();

    cy.findByTestId("counter-0").findByTestId("value").should("have.text", "0");
    cy.findByTestId("counter-1").findByTestId("value").should("have.text", "0");

    cy.findByTestId("counter-1").findByText("Increment").click();
    cy.findByTestId("counter-1").findByText("Increment").click();
    cy.findByTestId("counter-1").findByText("Increment").click();
    cy.findByTestId("counter-1").findByTestId("value").should("have.text", "3");

    cy.findByTestId("counter-0").findByText("Decrement").click();
    cy.findByTestId("counter-0").findByText("Decrement").click();
    cy.findByTestId("counter-0")
      .findByTestId("value")
      .should("have.text", "-2");

    cy.findByText("Swap").click();
    cy.findByTestId("counter-0").findByTestId("value").should("have.text", "3");
    cy.findByTestId("counter-1")
      .findByTestId("value")
      .should("have.text", "-2");

    cy.findByText("Unshift").click();
    cy.findByTestId("counter-0").findByTestId("value").should("have.text", "0");
    cy.findByTestId("counter-1").findByTestId("value").should("have.text", "3");
    cy.findByTestId("counter-2")
      .findByTestId("value")
      .should("have.text", "-2");

    cy.findByText("Replace").click();
    cy.findByTestId("counter-0").findByTestId("value").should("have.text", "0");
    cy.findByTestId("counter-1").findByTestId("value").should("have.text", "0");
    cy.findByTestId("counter-2")
      .findByTestId("value")
      .should("have.text", "-2");
  });

  it("should handle nested field arrays", () => {
    cy.visit("/field-array/nested");

    cy.findByTestId("todo-0")
      .findByLabelText("Note 0")
      .should("have.value", "Default note 1");
    cy.findByTestId("todo-0")
      .findByLabelText("Note 1")
      .should("have.value", "Default note 2");
    cy.findByTestId("todo-1")
      .findByLabelText("Note 0")
      .should("have.value", "Default note 3");
    cy.findAllByTestId("note").should("have.length", 3);

    cy.findByText("Swap").click();

    cy.findByTestId("todo-2")
      .findByLabelText("Note 0")
      .should("have.value", "Default note 1");
    cy.findByTestId("todo-2")
      .findByLabelText("Note 1")
      .should("have.value", "Default note 2");
    cy.findByTestId("todo-1")
      .findByLabelText("Note 0")
      .should("have.value", "Default note 3");
    cy.findAllByTestId("note").should("have.length", 3);

    cy.findByTestId("todo-2")
      .findByLabelText("Note 1")
      .clear()
      .type("Something else");
    cy.findByTestId("todo-2").findByText("Delete note 0").click();

    cy.findByTestId("todo-2")
      .findByLabelText("Note 0")
      .should("have.value", "Something else");
    cy.findByTestId("todo-1")
      .findByLabelText("Note 0")
      .should("have.value", "Default note 3");
    cy.findAllByTestId("note").should("have.length", 2);

    cy.findByText("Submit").click();
    cy.findByText("Must have at least one note").should("exist");

    cy.findByTestId("todo-0").findByText("Add note").click();
    cy.findByTestId("todo-0")
      .findByLabelText("Note 0")
      .should("have.value", "New note");
    cy.findByText("Must have at least one note").should("not.exist");
  });

  [
    {
      route: "/field-array",
      variant: "With uncontrolled inputs",
    },
    {
      route: "/field-array/controlled",
      variant: "With controlled inputs",
    },
    {
      route: "/field-array/hook",
      variant: "With hook & uncontrolled inputs",
    },
    {
      route: "/field-array/hook/controlled",
      variant: "With hook & controlled inputs",
    },
  ].forEach(({ route, variant }) => {
    describe(variant, () => {
      it("should swap items", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        // Clear the first todo's title
        cy.findByTestId("todo-0").findByLabelText("Title").clear().blur();
        cy.findByTestId("todo-0")
          .findByText("Title is required")
          .should("be.visible");
        cy.findByText("todos[0].title touched").should("be.visible");

        cy.findByText("Swap").click();

        // Check new values
        cy.findByTestId("todo-0")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-0")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");
        cy.findByTestId("todo-0")
          .findByText("Title is required")
          .should("not.exist");
        cy.findByText("todos[0].title touched").should("not.exist");

        cy.findByTestId("todo-1")
          .findByLabelText("Title")
          .should("have.value", "Default 2");
        cy.findByTestId("todo-1")
          .findByLabelText("Notes")
          .should("have.value", "Default note 2");

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 1");
        cy.findByTestId("todo-2")
          .findByText("Title is required")
          .should("be.visible");
        cy.findByText("todos[2].title touched").should("be.visible");

        cy.findAllByTestId("todo-id").should("have.length", 3);
      });

      it("should insert items", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        // Clear the middle todo's title
        cy.findByTestId("todo-1").findByLabelText("Title").clear().blur();
        cy.findByTestId("todo-1")
          .findByText("Title is required")
          .should("be.visible");
        cy.findByText("todos[1].title touched").should("be.visible");

        cy.findByText("Insert").click();

        // Check new values
        cy.findByTestId("todo-0")
          .findByLabelText("Title")
          .should("have.value", "Default 1");
        cy.findByTestId("todo-0")
          .findByLabelText("Notes")
          .should("have.value", "Default note 1");

        cy.findByTestId("todo-1")
          .findByLabelText("Title")
          .should("have.value", "");
        cy.findByTestId("todo-1")
          .findByLabelText("Notes")
          .should("have.value", "");
        cy.findByTestId("todo-1")
          .findByText("Title is required")
          .should("not.exist");
        cy.findByText("todos[1].title touched").should("not.exist");

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 2");
        cy.findByTestId("todo-2")
          .findByText("Title is required")
          .should("be.visible");
        cy.findByText("todos[2].title touched").should("be.visible");

        cy.findByTestId("todo-3")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-3")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 4);
      });

      it("should pop the last item", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        // Pop the last item
        cy.findByText("Pop").click();

        // Check new values
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
      });

      it("should unshift a new item at the start", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        // Pop the last item
        cy.findByText("Unshift").click();

        // Check new values
        cy.findByTestId("todo-0")
          .findByLabelText("Title")
          .should("have.value", "");
        cy.findByTestId("todo-0")
          .findByLabelText("Notes")
          .should("have.value", "");

        cy.findByTestId("todo-1")
          .findByLabelText("Title")
          .should("have.value", "Default 1");
        cy.findByTestId("todo-1")
          .findByLabelText("Notes")
          .should("have.value", "Default note 1");

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 2");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 2");

        cy.findByTestId("todo-3")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-3")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 4);

        cy.findByTestId("todo-0").findByLabelText("Title").type("New 1").blur();
        cy.findByText("Unshift").click();
        cy.findAllByTestId("todo-id").should("have.length", 5);
      });

      it("should replace items", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        // Pop the last item
        cy.findByText("Replace").click();

        // Check new values
        cy.findByTestId("todo-0")
          .findByLabelText("Title")
          .should("have.value", "Default 1");
        cy.findByTestId("todo-0")
          .findByLabelText("Notes")
          .should("have.value", "Default note 1");

        cy.findByTestId("todo-1")
          .findByLabelText("Title")
          .should("have.value", "New title");
        cy.findByTestId("todo-1")
          .findByLabelText("Notes")
          .should("have.value", "New note");

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);
      });

      it("should push items at the end", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        // Pop the last item
        cy.findByText("Push").click();

        // Check new values
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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findByTestId("todo-3")
          .findByLabelText("Title")
          .should("have.value", "New title");
        cy.findByTestId("todo-3")
          .findByLabelText("Notes")
          .should("have.value", "New note");

        cy.findAllByTestId("todo-id").should("have.length", 4);
      });

      it("should move items", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        // Clear the first todo's title
        cy.findByTestId("todo-0").findByLabelText("Title").clear().blur();
        cy.findByTestId("todo-0")
          .findByText("Title is required")
          .should("be.visible");
        cy.findByText("todos[0].title touched").should("be.visible");

        cy.findByText("Move").click();

        // Check new values
        cy.findByTestId("todo-0")
          .findByLabelText("Title")
          .should("have.value", "Default 2");
        cy.findByTestId("todo-0")
          .findByLabelText("Notes")
          .should("have.value", "Default note 2");
        cy.findByTestId("todo-0")
          .findByText("Title is required")
          .should("not.exist");
        cy.findByText("todos[0].title touched").should("not.exist");

        cy.findByTestId("todo-1")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-1")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 1");
        cy.findByTestId("todo-2")
          .findByText("Title is required")
          .should("be.visible");
        cy.findByText("todos[2].title touched").should("be.visible");

        cy.findAllByTestId("todo-id").should("have.length", 3);
      });

      it("should remove items", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        // Clear the last todo's title
        cy.findByTestId("todo-2").findByLabelText("Title").clear().blur();
        cy.findByTestId("todo-2")
          .findByText("Title is required")
          .should("be.visible");
        cy.findByText("todos[2].title touched").should("be.visible");

        cy.findByTestId("todo-1").findByText("Delete todo").click();

        // Check new values
        cy.findByTestId("todo-0")
          .findByLabelText("Title")
          .should("have.value", "Default 1");
        cy.findByTestId("todo-0")
          .findByLabelText("Notes")
          .should("have.value", "Default note 1");

        cy.findByTestId("todo-1")
          .findByLabelText("Title")
          .should("have.value", "");
        cy.findByTestId("todo-1")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");
        cy.findByTestId("todo-1")
          .findByText("Title is required")
          .should("be.visible");
        cy.findByText("todos[1].title touched").should("be.visible");

        cy.findAllByTestId("todo-id").should("have.length", 2);
      });

      it("should reset", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        // Change stuff
        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .clear()
          .type("Something else")
          .blur();
        cy.findByTestId("todo-1").findByText("Delete todo").click();
        cy.findByText("Insert").click();
        cy.findByText("Push").click();
        cy.findByText("Swap").click();
        cy.findByText("Move").click();

        // Then reset
        cy.findByText("Reset").click();

        // Back to default values
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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);
      });

      it("should show errors", () => {
        cy.visit(route).waitForJs();

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

        cy.findByTestId("todo-2")
          .findByLabelText("Title")
          .should("have.value", "Default 3");
        cy.findByTestId("todo-2")
          .findByLabelText("Notes")
          .should("have.value", "Default note 3");

        cy.findAllByTestId("todo-id").should("have.length", 3);

        cy.findByTestId("todo-2").findByText("Delete todo").click();
        cy.findByTestId("todo-0").findByText("Delete todo").click();

        cy.findAllByTestId("todo-id").should("have.length", 1);
        cy.findByText("Must have at least two todos").should("not.exist");

        cy.findByText("Submit").click();
        cy.findByText("Must have at least two todos").should("exist");

        cy.findByText("Push").click();
        cy.findByText("Must have at least two todos").should("not.exist");

        cy.findByTestId("todo-0").findByText("Delete todo").click();
        cy.findByText("Must have at least two todos").should("exist");
      });
    });
  });
});
