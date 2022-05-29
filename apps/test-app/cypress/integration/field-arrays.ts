describe("Field arrays", () => {
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

  [
    {
      route: "/field-array",
      variant: "Uncontrolled",
    },
    {
      route: "/field-array/controlled",
      variant: "Controlled",
    },
  ].forEach(({ route, variant }) => {
    describe(variant, () => {
      it("should swap items", () => {
        cy.visit(route);

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
        cy.visit(route);

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
        cy.visit(route);

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
        cy.visit(route);

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
      });

      it("should replace items", () => {
        cy.visit(route);

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
        cy.visit(route);

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
        cy.visit(route);

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
        cy.visit(route);

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
    });
  });
});
