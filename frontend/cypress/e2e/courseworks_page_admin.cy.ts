describe("Coursework listing page - admin tests", () => {
  beforeEach(() => {
    cy.exec("npm run db:seed");
    cy.clearAuthSession();
    cy.login("admin@bris.ac.uk", "changeme", false);
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

  it("has default ongoing unit", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-unit-tab-computer-architecture-2025-2026").should(
      "be.visible",
    );
  });

  it("has default finished coursework", () => {
    cy.visit("/coursework");
    cy.getByCy(
      "coursework-link-computer-architecture-2025-2026-encrypt",
    ).should("be.visible");
  });

  it("Allows navigation through the ongoing coursework tabslist", () => {
    cy.visit("/coursework");
    cy.getByCy(
      "coursework-unit-tab-software-engineering-project-2025-2026",
    ).click();
    cy.getByCy(
      "coursework-link-software-engineering-project-2025-2026-ai-bill-splitter",
    ).should("be.visible");
  });

  // Finsihed coursework stuff
  it("has default finished unit", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").should(
      "be.visible",
    );
  });

  it("has default finished coursework", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy(
      "coursework-link-computer-architecture-2024-2025-encrypt",
    ).should("be.visible");
  });

  it("Allows navigation through the finsihed coursework tabslist", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy(
      "coursework-unit-tab-imperative-and-functional-programming-2024-2025",
    ).click();
    cy.getByCy(
      "coursework-link-imperative-and-functional-programming-2024-2025-power-to-the-people-in-2024",
    ).should("be.visible");
  });

  it("Admin can open the create coursework flow", () => {
    cy.visit("/coursework");
    cy.getByCy("create-coursework-link").click();
    cy.url().should("include", "/coursework/create-coursework");
    cy.getByCy("create-coursework-title").should("be.visible");
    cy.getByCy("create-coursework-unit").should("be.visible");
  });

  it("Admin can create coursework", () => {
    const courseworkName = `Cypress Created Coursework ${Date.now()}`;
    const courseworkSelectorName = courseworkName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    cy.visit("/coursework");
    cy.getByCy("create-coursework-link").click();
    cy.getByCy(
      "create-coursework-unit-option-coms20006-software-engineering-project",
    ).then(($option) => {
      const unitValue = $option.val()?.toString();
      expect(unitValue).to.be.a("string");
      expect(unitValue).to.not.equal("");
      if (!unitValue) {
        throw new Error("Expected coursework unit option to have a value.");
      }
      cy.getByCy("create-coursework-unit").select(unitValue);
    });
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
    cy.getByCy(
      "coursework-unit-tab-software-engineering-project-2025-2026",
    ).click();
    cy.getByCy(
      `coursework-link-software-engineering-project-2025-2026-${courseworkSelectorName}`,
    ).should("be.visible");
  });

  // Deletion
  it("Admin can delete coursework", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-card-computer-architecture-2025-2026-encrypt")
      .should("be.visible")
      .as("courseworkCard");
    cy.get("@courseworkCard")
      .find('[data-cy="coursework-list-actions-trigger"]')
      .click();
    cy.getByCy("coursework-list-delete-item").click();
    cy.getByCy("coursework-delete-confirm").click();
    cy.get(
      '[data-cy="coursework-link-computer-architecture-2025-2026-encrypt"]',
    ).should("not.exist");
  });
});
