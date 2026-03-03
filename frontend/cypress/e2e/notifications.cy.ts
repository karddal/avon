describe("Notifications", () => {
  before(() => {
    cy.exec("npm run db:seed");
  });

  it("shows no notifications with no notifications in the system", () => {
    cy.login("rohan@bris.ac.uk", "changeme", true);
    cy.get("button.p-2:nth-child(2)").click();
    cy.get(".max-w-sm > .text-lg").should(
      "contain.text",
      "You have no notifications",
    );
  });

  it("shows a notification when a notification has been added", () => {
    cy.login("one@bris.ac.uk", "changeme", false);
    cy.contains("Units").click();
    cy.contains("Imperative and Functional Programming").click();
    cy.get("div.aspect-square button").click();
    cy.contains("Send Notification").click();
    cy.wait(500);
    cy.get("#notification-form-title").type("Test notification");
    cy.get("#notification-form-body").type("Test body");
    cy.get("button.gap-2:nth-child(2)").click();
    cy.get('[data-content=""] > div').should("exist"); // sonner

    cy.login("rohan@bris.ac.uk", "changeme", true);
    cy.get("button.p-2:nth-child(2)").click();
    cy.get("span.absolute").contains("1");
    cy.contains("button", "Imperative and Functional Programming").should(
      "exist",
    );
    cy.contains("button", "Imperative and Functional Programming").click();
    cy.contains("Test notification").should("exist");
  });

  it("successfully marks a notification as read", () => {
    cy.login("rohan@bris.ac.uk", "changeme", true);
    cy.get("button.p-2:nth-child(2)").click();
    cy.get("span.absolute").contains("1");
    cy.contains("button", "Imperative and Functional Programming").should(
      "exist",
    );
    cy.contains("button", "Imperative and Functional Programming").click();
    cy.contains("Test notification").should("exist");
    cy.get('[data-slot="item-actions"] > .inline-flex').click();
    cy.get("svg.lucide.lucide-loader-circle.size-4.animate-spin").should(
      "not.be.visible",
    );
    cy.get(".lucide-dot").should("not.exist");
  });
});
