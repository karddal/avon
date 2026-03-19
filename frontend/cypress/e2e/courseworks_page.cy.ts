describe("Coursework listing page", () => {
  before(() => {
    cy.exec("npm run db:seed");
  });

  beforeEach(() => {
    cy.login("one@bris.ac.uk", "changeme", false);
  });

  it("successfully loads", () => {
    cy.visit("/coursework");
    cy.url().should("include", "/coursework");
  });

  it("has tabs", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tabs").should("be.visible");
  });

  // Ongoing coursework stuff

  // it("shows no courseworks found for ongoing coursework", () => {
  //   cy.visit("/coursework");
  //   cy.contains("No coursework found").should("be.visible");
  // });

  // Finsihed coursework stuff
  it("has default finished unit", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy(
      "coursework-unit-tab-imperative-and-functional-programming-2024-2025",
    ).should("be.visible");
  });

  it("has default finished coursework", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy(
      "coursework-unit-tab-imperative-and-functional-programming-2024-2025",
    ).click();
    cy.getByCy(
      "coursework-link-imperative-and-functional-programming-2024-2025-power-to-the-people-in-2024",
    ).should(
      "be.visible",
    );
  });

  it("Allows navigation through the finsihed coursework tabslist", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").should(
      "be.visible",
    );
  });
});
