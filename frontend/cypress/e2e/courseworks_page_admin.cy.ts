describe("Coursework listing page - admin tests", () => {
  beforeEach(() => {
    cy.exec("npm run db:seed");
    cy.wait(500);
    cy.login("admin@bris.ac.uk", "changeme", false);
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

  it("has default ongoing unit", () => {
    cy.visit("/coursework");
    cy.get("span").should("contain", "Computer Architecture");
  });

  it("has default finished coursework", () => {
    cy.visit("/coursework");
    cy.get("p").should("contain", "Encrypt");
  });

  it("Allows navigation through the ongoing coursework tabslist", () => {
    cy.visit("/coursework");
    cy.contains('[role="tab"]', "Software Engineering Project").click();
    cy.get("p").should("contain", "AI Bill Splitter");
  });

  // Finsihed coursework stuff
  it("has default finished unit", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.get("span").should("contain", "Computer Architecture");
  });

  it("has default finished coursework", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.get("p").should("contain", "Encrypt");
  });

  it("Allows navigation through the finsihed coursework tabslist", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains(
      '[role="tab"]',
      "Imperative and Functional Programming",
    ).click();
    cy.get("p").should("contain", "Power to the People in 2024");
  });

  // Deletion
  it("Admin can delete coursework", () => {
    cy.visit("/coursework");
    cy.contains("p", "Encrypt")
      .should("be.visible")
      .closest(".bg-muted")
      .as("courseworkCard");
    cy.get("@courseworkCard")
      .find('button[data-slot="dropdown-menu-trigger"]')
      .click();
    cy.get(`[data-slot="dropdown-menu-item"]`).click();
    cy.get(`[data-slot="button"]`).click();
    cy.get('[data-content=""] > div').contains(
      "Coursework deleted successfully",
    );
    cy.get("p").should("not.contain", "Encrypt");
  });
});
