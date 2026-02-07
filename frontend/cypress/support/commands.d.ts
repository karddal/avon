import { mount } from "cypress/react";

type MountParams = Parameters<typeof mount>;
type MountReturn = ReturnType<typeof mount>;

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      mount(...args: MountParams): MountReturn;
      login(email: string, password: string): Chainable<void>;
    }
  }
}
