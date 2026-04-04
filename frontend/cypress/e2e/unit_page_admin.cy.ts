describe("Unit page", () => {
  before(() => {
    cy.exec("npm run db:seed");
  });

  beforeEach(() => {
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
    cy.get(`[data-slot="dropdown-menu-item"]`).contains("Edit Unit").click();
    cy.get('[name="name"]')
      .clear()
      .should("have.value", "")
      .type("Mathematics for Computer Science B");
    cy.get(".mt-auto > .flex > .inline-flex").click();
    cy.visit("/units");
    cy.get("p")
      .contains("Mathematics for Computer Science B")
      .should("be.visible");
  });

  it("admin can delete unit", () => {
    cy.visit("/units");
    cy.contains('[role="tab"]', "Year 1 Computer Science 2025-2026").click();
    cy.get("p")
      .should("contain", "Mathematics for Computer Science B")
      .should("be.visible");
    cy.get("#unit-dropdown-button").click();
    cy.get(`[data-cy="unit-delete-menu-item"]`).click();
    cy.contains(`button`, "Delete").click();
    cy.get('[data-content=""] > div').contains("Unit deleted successfully");
  });
});
