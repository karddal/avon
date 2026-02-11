/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string, student: boolean): Chainable<void>;
      dbPrepare(): Chainable<Cypress.Exec>;
      getByCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
