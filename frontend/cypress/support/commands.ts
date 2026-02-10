/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
/// <reference path="./commands.d.ts" />

Cypress.Commands.add("login", (username: string, password: string) => {
  cy.session(
    username,
    () => {
      cy.visit("/login");
      cy.get("#email").type(username);
      cy.get("#password").type(password);

      cy.get("button[type=submit]").click();
    },
    {
      validate: () => {
        cy.getCookie("__Secure-better-auth.session_token").should("exist");
      },
    },
  );
});

// cypress/support/commands.ts
Cypress.Commands.add("loginNew", (username: string, password: string) => {
  cy.session(
    `better-auth:${username}`,
    () => {
      cy.visit("/login");
      cy.get("#email").clear().type(username);
      cy.get("#password").clear().type(password);
      cy.get("button[type=submit]").click();

      cy.url().should("include", "/dashboard");
      cy.getCookie("__Secure-better-auth.session_token").should("exist");
    },
    {
      validate: () => {
        cy.request({
          url: "/dashboard",
          failOnStatusCode: false,
          followRedirect: false,
        }).then((res) => {
          expect([200]).to.include(res.status);
          expect(res.body).to.not.include('id="email"');
        });
      },
      cacheAcrossSpecs: true,
    },
  );
});
