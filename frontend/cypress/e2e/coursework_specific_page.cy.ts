describe("Coursework page", () => {
  before(() => {
    cy.exec("npm run db:seed");
  });

  beforeEach(() => {
    cy.login("josh@bris.ac.uk", "changeme", true);
  });

  it("successfully loads", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture 2024-2025").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.url().should("include", "/coursework/");
  });

  it("Contains a Title", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture 2024-2025").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").should("contain", "Encrypt");
  });

  it("Contains a Description", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture 2024-2025").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").find(".text-2xl").should("contain", "Description");
  });

  it("Conatins an Information section", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture 2024-2025").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").find(".text-2xl").should("contain", "Information");
  });

  it("Does not show the CW setup flow", () => {
    cy.visit("/coursework");
    cy.contains("button", "Finished").click();
    cy.contains('[role="tab"]', "Computer Architecture 2024-2025").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.contains("Setup Progress").should("not.exist");
  });
});
