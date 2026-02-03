describe("Unit page", () => {
  beforeEach(() => {
    cy.exec("npm run db:reset && npm run db:seed");
    cy.login("admin@bris.ac.uk", "changeme");
  });

  it("admin can visit units", () => {
    cy.visit("/units");
  });

  it("admin has default ongoing programmes", () => {
    cy.visit("/units");
    cy.get("span").should("contain", "Year 1 Computer Science 2025/2026");
    cy.get("span").should("contain", "Year 2 Computer Science 2025/2026");
  });

  it("admin has default finished programmes", () => {
    cy.visit("/units");
    cy.get("#radix-_R_9bneitmlb_-trigger-finished").click();
    cy.get("span").should("contain", "Year 1 Computer Science 2024/2025");
    cy.get("span").should("contain", "Year 2 Computer Science 2024/2025");
  });

  it("admin has default ongoing unit", () => {
    cy.visit("/units");
    cy.get("p").should("contain", "Mathematics for Computer Science A");
  });

  it("admin has default finished unit", () => {
    cy.visit("/units");
    cy.get("#radix-_R_9bneitmlb_-trigger-finished").click();

    cy.get("p").should("contain", "Mathematics for Computer Science A");
  });

  it("admin can edit unit", () => {
    cy.visit("/units");
    cy.contains(
      'a[href^="/units/"]',
      "Mathematics for Computer Science A",
    ).click({ force: true });
    cy.url().should("not.eq", `${Cypress.config().baseUrl}/units`);
    cy.url().should("include", "/units/");
    cy.get("#coursework-dropdown", { timeout: 10000 }).click();
    cy.get(`[data-slot="dropdown-menu-item"]`).contains("Edit coursework").click();
    // cy.get('[name="name"]').clear().type("Mathematics for Computer Science B");
    // cy.get(".mt-auto > .flex > .inline-flex").click();
    // cy.visit("/units");
    // cy.get("p")
    //   .contains("Mathematics for Computer Science B")
    //   .should("be.visible");
  });

  it("admin can delete unit", () => {
    cy.visit("/units");
    cy.get("p")
      .should("contain", "Mathematics for Computer Science A")
      .should("be.visible");
    cy.get("#radix-_R_35mpbneitmlb_").click();
    cy.get(`[data-slot="dropdown-menu-item"]`).click();
    cy.get(`[data-slot="button"]`).click();
    cy.get('[data-content=""] > div').contains("Unit deleted successfully");
    cy.get("p").should("not.contain", "Mathematics for Computer Science A");
  });
});
