describe("Notifications", () => {
  const openNotifications = () => {
    cy.get('[data-cy="notifications-trigger"]').click();
  };

  before(() => {
    cy.resetDb();
  });

  it("shows no notifications with no notifications in the system", () => {
    cy.login("rohan@bris.ac.uk", "changeme", true);
    openNotifications();
    cy.get(".max-w-sm > .text-lg").should(
      "contain.text",
      "You have no notifications",
    );
  });

  it("shows a notification when a notification has been added", () => {
    cy.login("one@bris.ac.uk", "changeme", false);
    cy.visit("/units");
    cy.contains(
      'a[href^="/units/"]',
      "Imperative and Functional Programming",
    ).click({ force: true });
    cy.get('[data-cy="unit-dropdown"]').click();
    cy.get('[data-cy="unit-send-notification"]').click();
    cy.wait(500);
    cy.get("#notification-form-title").type("Test notification");
    cy.get("#notification-form-body").type("Test body");
    cy.contains("button", "Send").click();
    cy.contains("Notification sent.").should("be.visible");

    cy.login("rohan@bris.ac.uk", "changeme", true);
    openNotifications();
    cy.contains('[role="tab"]', "Imperative and Functional Programming").should(
      "exist",
    );
    cy.contains(
      '[role="tab"]',
      "Imperative and Functional Programming",
    ).click();
    cy.contains("Test notification").should("exist");
  });

  it("successfully marks a notification as read", () => {
    cy.login("rohan@bris.ac.uk", "changeme", true);
    openNotifications();
    cy.contains('[role="tab"]', "Imperative and Functional Programming").should(
      "exist",
    );
    cy.contains(
      '[role="tab"]',
      "Imperative and Functional Programming",
    ).click();
    cy.contains("Test notification").should("exist");
<<<<<<< HEAD
    cy.get('[data-slot="item-actions"] > .inline-flex').click();
    cy.get("svg.lucide.lucide-loader-circle.size-4.animate-spin").should(
      "not.be.visible",
    );
    // cy.get(".lucide-dot").should("not.exist");
=======
    cy.get('[data-cy="notification-mark-read"]').click();
    cy.get('[data-cy="notification-mark-read"]').should("not.exist");
>>>>>>> dev
  });
});
