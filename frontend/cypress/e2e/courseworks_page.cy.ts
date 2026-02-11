describe("Coursework listing page", () => {
  before(() => {
    cy.exec("npm run db:seed");
    cy.wait(500);
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
    cy.get('[data-slot="tabs"]').should("be.visible");
  });

  // Ongoing coursework stuff

  it("shows no courseworks found for ongoing coursework", () => {
    cy.visit("/coursework");
    cy.contains("No coursework found").should("be.visible");
  });

  // Finsihed coursework stuff
  it("has default finished unit", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.get("span").should("contain", "Imperative and Functional Programming");
  });

  it("has default finished coursework", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.get("p").should("contain", "Power to the People in 2025");
  });

  it("Allows navigation through the finsihed coursework tabslist", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "2024-2025").click();
    cy.get("p").should("contain", "Power to the People in 2024");
  });
});
