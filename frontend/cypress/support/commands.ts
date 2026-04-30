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

// type TestProgrammePayload = {
//   name: string;
//   start_date: string;
//   end_date: string;
// };

// type TestUnitPayload = {
//   name: string;
//   description: string;
//   unit_code: string;
//   colour: string;
//   programme_id: string;
//   owner: string;
// };

// type TestCourseworkPayload = {
//   name: string;
//   description: string;
//   unit_id: string;
//   due_date: string;
//   colour: string;
// };

// function fixtureHeaders() {
//   const testFixtureKey = Cypress.env("testFixtureKey");
//   if (!testFixtureKey) {
//     throw new Error("Cypress testFixtureKey env is not configured");
//   }

//   return {
//     "Content-Type": "application/json",
//     "X-Test-Fixture-Key": String(testFixtureKey),
//   };
// }

// function fixtureUrl(path: string) {
//   const apiUrl = Cypress.env("apiUrl");
//   if (!apiUrl) {
//     throw new Error("Cypress apiUrl env is not configured");
//   }

//   return `${String(apiUrl)}${path}`;
// }

Cypress.Commands.add("clearAuthSession", () => {
  cy.clearCookie("__Secure-better-auth.session_token");
  cy.clearCookie("better-auth.session_token");
});

Cypress.Commands.add(
  "login",
  (username: string, password: string, student: boolean) => {
    const redirectPath = student ? "/units" : "/dashboard";

    cy.session(
      [username, student],
      () => {
        cy.visit("/login");
        cy.location("pathname").should("eq", "/login");

        cy.get("#email").should("be.visible").clear().type(username, {
          force: true,
        });
        cy.get("#password").clear().type(password, { force: true });
        cy.get("button[type=submit]").click({ force: true });
        cy.url().should("include", redirectPath);
        cy.getCookie("__Secure-better-auth.session_token").should("exist");
      },
      {
        cacheAcrossSpecs: true,
        validate() {
          cy.getCookie("__Secure-better-auth.session_token").should("exist");
          cy.request("/api/auth/get-session").its("status").should("eq", 200);
        },
      },
    );

    cy.visit(redirectPath);
    if (student) {
      cy.url().should("include", "/units");
    } else {
      cy.url().should("include", "/dashboard");
    }
  },
);

Cypress.Commands.add("resetDb", () => {
  return cy
    .request("POST", "http://localhost:8000/seeding/reset-app-data")
    .its("body.status")
    .should("eq", "ok")
    .then(() => undefined);
});

Cypress.Commands.add("getByCy", (value: string) => {
  return cy.get(`[data-cy="${value}"]`);
});

// Cypress.Commands.add("testResetDomain", () => {
//   return cy.request({
//     method: "POST",
//     url: fixtureUrl("/testing/fixtures/reset-domain"),
//     headers: fixtureHeaders(),
//   });
// });

// Cypress.Commands.add("testCreateProgramme", (payload: TestProgrammePayload) => {
//   return cy.request({
//     method: "POST",
//     url: fixtureUrl("/testing/fixtures/programmes"),
//     headers: fixtureHeaders(),
//     body: payload,
//   });
// });

// Cypress.Commands.add("testCreateUnit", (payload: TestUnitPayload) => {
//   return cy.request({
//     method: "POST",
//     url: fixtureUrl("/testing/fixtures/units"),
//     headers: fixtureHeaders(),
//     body: payload,
//   });
// });

// Cypress.Commands.add(
//   "testCreateCoursework",
//   (payload: TestCourseworkPayload) => {
//     return cy.request({
//       method: "POST",
//       url: fixtureUrl("/testing/fixtures/courseworks"),
//       headers: fixtureHeaders(),
//       body: payload,
//     });
//   },
// );

// Cypress.Commands.add(
//   "testEnrollStudents",
//   (unitId: string, userIds: string[]) => {
//     return cy.request({
//       method: "POST",
//       url: fixtureUrl("/testing/fixtures/unit-enrollments/students"),
//       headers: fixtureHeaders(),
//       body: {
//         unit_id: unitId,
//         user_ids: userIds,
//       },
//     });
//   },
// );

// Cypress.Commands.add(
//   "testEnrollLecturers",
//   (unitId: string, userIds: string[]) => {
//     return cy.request({
//       method: "POST",
//       url: fixtureUrl("/testing/fixtures/unit-enrollments/lecturers"),
//       headers: fixtureHeaders(),
//       body: {
//         unit_id: unitId,
//         user_ids: userIds,
//       },
//     });
//   },
// );
