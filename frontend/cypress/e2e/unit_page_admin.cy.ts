describe("Unit page", () => {
  before(() => {
    cy.resetDb();
  });

  beforeEach(() => {
    cy.clearAuthSession();
    cy.login("admin@bris.ac.uk", "changeme", false);
  });

  it("admin can visit units", () => {
    cy.visit("/units");
  });

  it("admin has default ongoing programmes", () => {
    cy.visit("/units");
    cy.get("span").should("contain", "Year 1 Computer Science 2025-2026");
    cy.get("span").should("contain", "Year 2 Computer Science 2025-2026");
  });

  it("admin has default finished programmes", () => {
    cy.visit("/units");
    cy.get("#tabs-finished").click();
    cy.get("span").should("contain", "Year 1 Computer Science 2024-2025");
    cy.get("span").should("contain", "Year 2 Computer Science 2024-2025");
  });

  it("admin has default ongoing unit", () => {
    cy.visit("/units");
    cy.get("p").should("contain", "Mathematics for Computer Science A");
  });

  it("admin has default finished unit", () => {
    cy.visit("/units");
    cy.get("#tabs-finished").click();

    cy.get("p").should("contain", "Mathematics for Computer Science A");
  });

  it("admin can edit unit", () => {
    cy.visit("/units");
    cy.contains('[role="tab"]', "Year 1 Computer Science 2025-2026").click();
    cy.contains(
      'a[href^="/units/"]',
      "Mathematics for Computer Science A",
    ).click({ force: true });
    cy.url().should("not.eq", `${Cypress.config().baseUrl}/units`);
    cy.url().should("include", "/units/");
    cy.get("#unit-dropdown", { timeout: 10000 }).click();
    cy.getByCy("unit-edit-menu-item").click();
    cy.getByCy("unit-edit-name")
      .clear()
      .should("have.value", "")
      .type("Mathematics for Computer Science B");
    cy.getByCy("unit-edit-save").click();
    cy.contains("Unit updated successfully.").should("be.visible");
    cy.visit("/units");
    cy.get("p")
      .contains("Mathematics for Computer Science B")
      .should("be.visible");
  });

  it("admin can delete unit", () => {
    cy.visit("/units");
    cy.contains('[role="tab"]', "Year 1 Computer Science 2025-2026").click();
    cy.contains("p", "Mathematics for Computer Science B")
      .should("be.visible")
      .closest("a")
      .parent()
      .as("unitCard");
    cy.get("@unitCard").find("#unit-dropdown-button").click();
    cy.get('[data-cy="unit-list-delete"]').click();
    cy.get('[data-cy="confirm-delete-unit"]').click();
    cy.contains("Unit deleted successfully").should("be.visible");
  });
});
