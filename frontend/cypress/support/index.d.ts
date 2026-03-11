/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string, student: boolean): Chainable<void>;
      resetDb(): Chainable<void>;
      getByCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
