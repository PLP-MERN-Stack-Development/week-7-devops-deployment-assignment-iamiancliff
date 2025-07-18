describe("Bug Tracker CRUD flow", () => {
  beforeEach(() => {
    cy.visit("/");
  });

it("should create a new bug", () => {
    cy.get("input[name=title]").type("Login button broken");
    cy.get("textarea[name=description]").type("Button doesn't work on Safari.");
    cy.get("input[name=reportedBy]").type("ian");
    cy.get("select[name=severity]").select("High");
    cy.get("select[name=status]").select("Open");
    cy.get("select[name=priority]").select("Urgent");

    cy.get("button").contains("Submit").click();

    cy.contains("Login button broken").should("exist");
  });

  it("should edit a bug", () => {
    cy.contains("Login button broken")
      .parent()
      .find("button")
      .contains("Edit")
      .click();

    cy.get("input[name=title]").clear().type("Login bug updated");
    cy.get("button").contains("Submit").click();
    cy.contains("Login bug updated").should("exist");
  });

  it("should delete a bug", () => {
    cy.contains("Login bug updated")
      .parent()
      .find("button")
      .contains("Delete")
      .click();

    cy.contains("Login bug updated").should("not.exist");
  });
});
