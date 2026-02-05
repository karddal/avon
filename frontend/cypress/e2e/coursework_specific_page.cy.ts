describe("Coursework page", () => {
  before(() => {
    cy.exec("npm run db:reset && npm run db:seed");
    cy.wait(500);
  });

  beforeEach(() => {
    cy.visit("/login");
    cy.get("#email").type("josh@bris.ac.uk");
    cy.get("#password").type("changeme");
    cy.get("button[type=submit]").click();
    cy.visit("/coursework", { timeout: 10000 });
  });

  it("successfully loads", () => {
    cy.visit("/coursework");
    cy.get("#radix-_R_9bneitmlb_-trigger-finished").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.url().should("include", "/coursework/");
  });

  it("Contains a Title", () => {
    cy.visit("/coursework");
    cy.get("#radix-_R_9bneitmlb_-trigger-finished").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").should("contain", "Encrypt");
  });

  it("Contains a Description", () => {
    cy.visit("/coursework");
    cy.get("#radix-_R_9bneitmlb_-trigger-finished").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").find(".text-2xl").should("contain", "Description");
  });

  it("Conatins an Activity section", () => {
    cy.visit("/coursework");
    cy.get("#radix-_R_9bneitmlb_-trigger-finished").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").find(".text-2xl").should("contain", "Activity");
  });

  it("Contains a Tools section", () => {
    cy.visit("/coursework");
    cy.get("#radix-_R_9bneitmlb_-trigger-finished").click();
    cy.contains('a[href^="/coursework/"]', "Encrypt").click({ force: true });
    cy.get("div").should("contain", "Tools");
  });
});
