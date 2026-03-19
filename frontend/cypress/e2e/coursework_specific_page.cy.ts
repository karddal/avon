describe("Coursework page", () => {
  before(() => {
    cy.exec("npm run db:seed");
  });

  beforeEach(() => {
    cy.login("josh@bris.ac.uk", "changeme", true);
  });

  it("successfully loads", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click(
      {
        force: true,
      },
    );
    cy.url().should("include", "/coursework/");
  });

  it("Contains a Title", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click(
      {
        force: true,
      },
    );
    cy.getByCy("coursework-title").should("contain", "Encrypt");
  });

  it("Contains a Description", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click(
      {
        force: true,
      },
    );
    cy.getByCy("coursework-description-section").should("be.visible");
    cy.getByCy("coursework-description-content").should("be.visible");
  });

  it("Conatins an Information section", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click(
      {
        force: true,
      },
    );
    cy.getByCy("coursework-information-section").should("be.visible");
  });

  it("Does not show the CW setup flow", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click(
      {
        force: true,
      },
    );
    cy.getByCy("coursework-setup-progress").should("not.exist");
  });
});
