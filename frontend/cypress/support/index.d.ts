/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      clearAuthSession(): Chainable<void>;
      login(email: string, password: string, student: boolean): Chainable<void>;
      getByCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
