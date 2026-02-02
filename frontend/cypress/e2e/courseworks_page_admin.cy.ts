describe("Coursework page", () => {
  before(() => {
    cy.exec("npm run db:reset && npm run db:seed");
  });

  beforeEach(() => {
    cy.login("admin@bris.ac.uk", "changeme");
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
    cy.get('#radix-_R_9bneitmlb_-trigger-finished').click();
    cy.get("span").should("contain", "Computer Architecture");
  });

  it("has default finished coursework", () => {
    cy.visit("/coursework");
    cy.get('#radix-_R_9bneitmlb_-trigger-finished').click();
    cy.get("p").should("contain", "Encrypt"); 
  });

    it("Allows navigation through the finsihed coursework tabslist", () => {
    cy.visit("/coursework");
    cy.get('#radix-_R_9bneitmlb_-trigger-finished').click();
    cy.contains('[role="tab"]', "Imperative and Functional Programming").click();
    cy.get("p").should("contain", "Power to the People in 2024"); 
  });
});