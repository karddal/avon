describe("Coursework page", () => {
  beforeEach(() => {
    cy.exec("npm run db:seed");
    cy.wait(500);
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
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.url().should("include", "/coursework/");
  });

  it("Contains a Title", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").should("contain", "Encrypt");
  });

  it("Contains a Description", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").find(".text-2xl").should("contain", "Description");
  });

  it("Conatins an Information section", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").find(".text-2xl").should("contain", "Information");
  });

  it("Contains a Tools section", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").should("contain", "Tools");
  });

  it("Admin can edit a coursework name", () => {
    cy.visit("/coursework");
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get('[data-cy="coursework-lect-dropdown"]').click();
    cy.get('[data-state="open"]')
      .find('[data-slot="dropdown-menu-item"]')
      .contains("Edit coursework")
      .click();
    cy.get('[name="name"]').clear().type("Encrypt 2");
    cy.get(".mt-auto > .flex > .inline-flex").click();
    cy.wait(5000);
    cy.visit("/coursework");
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.get("p").contains("Encrypt 2").should("be.visible");
  });

  it("Admin can edit a coursework description", () => {
    cy.visit("/coursework");
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get('[data-cy="coursework-lect-dropdown"]').click();
    cy.get('[data-state="open"]')
      .find('[data-slot="dropdown-menu-item"]')
      .contains("Edit coursework")
      .click();
    cy.get("#form-flow-description").clear().type("UNique Text 2837t37");
    cy.get(".mt-auto > .flex > .inline-flex").click();
    cy.wait(5000);
    cy.visit("/coursework");
    cy.contains('[role="tab"]', "Computer Architecture").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").contains("UNique Text 2837t37").should("be.visible");
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
});
