declare namespace Cypress {
  interface Chainable {
    login(
      email: string,
      password: string,
      student: boolean,
    ): Cypress.Chainable<void>;
  }
}
