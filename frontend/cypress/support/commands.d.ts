/// <reference types="cypress" />

declare global {
    namespace Cypress {
        interface Chainable {
            login(email: string, password: string, student: boolean): Chainable<void>;
            loginNew(email: string, password: string): Chainable<void>;
        }
    }
}

export {}