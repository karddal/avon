describe("Coursework page", () => {
  beforeEach(() => {
    cy.exec("npm run db:seed");
    // cy.visit("/login");
    // cy.get("#email").type("admin@bris.ac.uk");
    // cy.get("#password").type("changeme");
    // cy.get("button[type=submit]").click();
    // cy.url().should("include", "/dashboard");
    // cy.getCookie("__Secure-better-auth.session_token").should("exist");
    cy.login("admin@bris.ac.uk", "changeme", false);
  });

  it("successfully loads", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click({
      force: true,
    });
    cy.url().should("include", "/coursework/");
  });

  it("Contains a Title", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click({
      force: true,
    });
    cy.getByCy("coursework-title").should("contain", "Encrypt");
  });

  it("Contains a Description", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click({
      force: true,
    });
    cy.getByCy("coursework-description-section").should("be.visible");
    cy.getByCy("coursework-description-content").should("be.visible");
  });

  it("Conatins an Information section", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click({
      force: true,
    });
    cy.getByCy("coursework-information-section").should("be.visible");
  });

  it("Admin can edit a coursework name", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-unit-tab-computer-architecture-2025-2026").click();
    cy.getByCy("coursework-link-computer-architecture-2025-2026-encrypt").click({
      force: true,
    });
    cy.getByCy("coursework-lect-dropdown").click();
    cy.getByCy("coursework-edit-menu-item").click();
    cy.getByCy("coursework-edit-name").clear().type("Encrypt 2");
    cy.getByCy("coursework-edit-save").click();
    cy.visit("/coursework");
    cy.getByCy("coursework-unit-tab-computer-architecture-2025-2026").click();
    cy.getByCy("coursework-link-computer-architecture-2025-2026-encrypt-2").should(
      "be.visible",
    );
  });

  it("Admin can edit a coursework description", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-unit-tab-computer-architecture-2025-2026").click();
    cy.getByCy("coursework-link-computer-architecture-2025-2026-encrypt").click({
      force: true,
    });
    cy.getByCy("coursework-lect-dropdown").click();
    cy.getByCy("coursework-edit-menu-item").click();
    cy.getByCy("coursework-edit-description").clear().type("UNique Text 2837t37");
    cy.getByCy("coursework-edit-save").click();
    cy.visit("/coursework");
    cy.getByCy("coursework-unit-tab-computer-architecture-2025-2026").click();
    cy.getByCy("coursework-link-computer-architecture-2025-2026-encrypt").click({
      force: true,
    });
    cy.getByCy("coursework-description-content")
      .should("contain", "UNique Text 2837t37");
  });

  // it("Admin can edit a coursework date", () => {
  //   cy.visit("/coursework");
  //   cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
  //   cy.get('[data-cy="coursework-lect-dropdown"]').click();
  //   cy.get('[data-state="open"]')
  //     .find('[data-slot="dropdown-menu-item"]')
  //     .contains("Edit coursework")
  //     .click();
  //   cy.get("#date").clear().type("24 February 2026");
  //   cy.get(".mt-auto > .flex > .inline-flex").click();
  //   cy.wait(5000);
  //   cy.visit("/coursework");
  //   cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
  //   cy.get("div").contains("24/02/26 at 12:00").should("be.visible");
  // });
  //
  it("shows the CW setup flow", () => {
    cy.visit("/coursework");
    cy.getByCy("coursework-tab-finished").click();
    cy.getByCy("coursework-unit-tab-computer-architecture-2024-2025").click();
    cy.getByCy("coursework-link-computer-architecture-2024-2025-encrypt").click({
      force: true,
    });
    cy.getByCy("coursework-setup-progress").should("be.visible");
  });
});
