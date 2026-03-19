describe("Coursework listing page - admin tests", () => {
  before(() => {
    cy.exec("npm run db:seed");
  });

  beforeEach(() => {
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
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.get("p").should("contain", "Encrypt");
  });

  it("Allows navigation through the finsihed coursework tabslist", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains(
      '[role="tab"]',
      "Imperative and Functional Programming 2024-2025",
    ).click();
    cy.get("p").should("contain", "Power to the People in 2024");
  it("Admin can create coursework", () => {
    const courseworkName = `Cypress Created Coursework ${Date.now()}`;
    const courseworkSelectorName = courseworkName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    cy.visit("/coursework");
    cy.getByCy("create-coursework-link").click();
    cy.getByCy("create-coursework-unit-option-coms20006-software-engineering-project").then(
      ($option) => {
        const unitValue = $option.val() as string | undefined;
        expect(unitValue).to.be.a("string");
        expect(unitValue).to.not.equal("");
        cy.getByCy("create-coursework-unit").select(unitValue!);
      },
    );
    cy.getByCy("create-coursework-selected-unit").should("be.visible");
    cy.getByCy("create-coursework-name").type(courseworkName);
    cy.getByCy("create-coursework-description").type(
      "Coursework created by the admin Cypress flow.",
    );
    cy.getByCy("create-coursework-next-step-1").click();
    cy.getByCy("create-coursework-next-step-2").click();
    cy.getByCy("create-coursework-submit").click();

    cy.url().should("include", "/coursework");
    cy.url().should("not.include", "/create-coursework");
    cy.getByCy("coursework-unit-tab-software-engineering-project-2025-2026").click();
    cy.getByCy(
      `coursework-link-software-engineering-project-2025-2026-${courseworkSelectorName}`,
    ).should(
      "be.visible",
    );
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
    // cy.get('[data-content=""] > div').contains(
    //   "Coursework deleted successfully",
    // );
    cy.get("p").should("not.contain", "Encrypt");
  });
});
