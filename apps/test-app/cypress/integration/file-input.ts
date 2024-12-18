// TODO: Update test to use stable file api
describe("File input", () => {
  it("should support uploading files", () => {
    cy.visit("/file-input").waitForJs();

    cy.findByLabelText("Description").type("This is a description");
    cy.get("input[type=file]").selectFile({
      contents: new Blob(["This is a file"]),
      fileName: "test.txt",
      mimeType: "text/plain",
      lastModified: Date.now(),
    });

    cy.findByText("Submit").click();
    cy.findByText(
      "Uploaded testFile with description This is a description",
    ).should("exist");
  });

  it("should be invalid if not file is selected", () => {
    cy.visit("/file-input").waitForJs();
    cy.findByLabelText("Description").type("This is a description");
    cy.findByText("Submit").click();
    cy.findByText("Please choose a file").should("exist");
  });
});
