describe("Login page", () => {
  before(() => {
    cy.resetDb();
  });

  it("redirects to login page", () => {
    cy.visit("/");
    cy.location("pathname").should("eq", "/login");
  });

  it("successfully loads", () => {
    cy.visit("/login");
  });

  it("has a login form", () => {
    cy.visit("/login");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("button").should("contain.text", "Login");
  });

  it(
    "sets auth cookie when logging in",
    {
      defaultCommandTimeout: 50000,
    },
    () => {
      cy.visit("/");

      cy.get("#email").type("one@bris.ac.uk");
      cy.get("#password").type("changeme");

      cy.get("button[type=submit]").click();
      cy.get('[data-content=""] > div').should("not.exist");
      cy.url().should("include", "/dashboard");
      cy.getCookie("__Secure-better-auth.session_token").should("exist");
      cy.get("span").should("contain", "One");
    },
  );

  it("shows error with invalid credentials", () => {
    cy.visit("/");

    cy.get("#email").type("asdf@bris.ac.uk");
    cy.get("#password").type("invalid");
    cy.get("button[type=submit]").click();

    cy.get('[data-content=""] > div').contains(
      "Login failed, please check your credentials.",
    );
  });
});
