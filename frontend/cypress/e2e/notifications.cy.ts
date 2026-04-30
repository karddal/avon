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
    const notificationTitle = "Test notification";
    const notificationBody = "Test body";

    cy.login("one@bris.ac.uk", "changeme", false);
    cy.visit("/units");
    cy.contains('a[href^="/units/"]', "Imperative and Functional Programming")
      .should("be.visible")
      .click();
    cy.get('[data-cy="unit-dropdown"]').click();
    cy.get('[data-cy="unit-send-notification"]').click();
    cy.get("#notification-form").should("be.visible");
    cy.get("#notification-form-title")
      .should("be.visible")
      .and("be.enabled")
      .click()
      .clear()
      .type(notificationTitle, { delay: 25 })
      .should("have.value", notificationTitle);
    cy.get("#notification-form-body")
      .should("be.visible")
      .and("be.enabled")
      .click()
      .clear()
      .type(notificationBody, { delay: 25 })
      .should("have.value", notificationBody);
    cy.contains("button", "Send").click();
    cy.contains("Notification sent.").should("be.visible");

    cy.clearAuthSession();
    cy.login("rohan@bris.ac.uk", "changeme", true);
    openNotifications();
    cy.contains('[role="tab"]', "Imperative and Functional Programming")
      .should("be.visible")
      .click()
      .should("have.attr", "data-active");
    cy.contains('[data-slot="tabs-content"]', notificationTitle).should(
      "be.visible",
    );
    cy.get('[data-cy="notification-mark-read"]').click();
    cy.get('[data-cy="notification-mark-read"]').should("not.exist");
  });
});
