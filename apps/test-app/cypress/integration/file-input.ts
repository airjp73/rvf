// TODO: Update test to use stable file api
describe.skip("File input", () => {
  it("should support uploading files", () => {
    cy.visit("/file-input").waitForJs();

    cy.findByLabelText("Description").type("This is a description");
    cy.get("input[type=file]").attachFile({
      fileContent: new Blob(["This is a file"]),
      fileName: "test.txt",
    });

    cy.findByText("Submit").click();
    cy.findByText(
      "Uploaded testFile with description This is a description"
    ).should("exist");
  });

  it("should be invalid if not file is selected", () => {
    cy.visit("/file-input").waitForJs();
    cy.findByLabelText("Description").type("This is a description");
    cy.findByText("Submit").click();
    cy.findByText("Please choose a file").should("exist");
  });
});
