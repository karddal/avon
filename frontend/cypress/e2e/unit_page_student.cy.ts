describe("Unit page", () => {
  before(() => {
    cy.exec("npm run db:reset && npm run db:seed");
  });

  beforeEach(() => {
    cy.login("charles@bris.ac.uk", "changeme", true);
  });

  it("successfully loads", () => {
    cy.visit("/units");
    cy.url().should("include", "/units");
  });

  it("has tabs", () => {
    cy.visit("/units");
    cy.get('[data-slot="tabs"]').should("be.visible");
  });

  it("has default ongoing programme", () => {
    cy.visit("/units");
    cy.get("span").should("contain", "Year 1 Computer Science 2025/2026");
  });

  it("has default ongoing unit", () => {
    cy.visit("/units");
    cy.get("p").should("contain", "Imperative and Functional Programming");
  });

  // Doesn't have any at the moment - will come back when seeding is finalised.
  //
  // it("has default finished programme", () => {
  //   cy.visit("/units");
  //   cy.get("#tabs-finished").click();
  //   cy.get("span").should("contain", "Year 1 Computer Science 2024/2025");
  // });

  // it("has default finished unit", () => {
  //   cy.visit("/units");
  //   cy.get("#tabs-finished").click();
  //   cy.get("p").should("contain", "Imperative and Functional Programming");
  // });
});
