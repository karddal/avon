/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface TestProgrammePayload {
      name: string;
      start_date: string;
      end_date: string;
    }

    interface TestUnitPayload {
      name: string;
      description: string;
      unit_code: string;
      colour: string;
      programme_id: string;
      owner: string;
    }

    interface TestCourseworkPayload {
      name: string;
      description: string;
      unit_id: string;
      due_date: string;
      colour: string;
    }

    interface Chainable {
      clearAuthSession(): Chainable<void>;
      login(email: string, password: string, student: boolean): Chainable<void>;
      resetDb(): Chainable<void>;
      getByCy(value: string): Chainable<JQuery<HTMLElement>>;
      // testResetDomain(): Chainable<Response<any>>;
      // testCreateProgramme(
      //   payload: TestProgrammePayload,
      // ): Chainable<Response<any>>;
      // testCreateUnit(payload: TestUnitPayload): Chainable<Response<any>>;
      // testCreateCoursework(
      //   payload: TestCourseworkPayload,
      // ): Chainable<Response<any>>;
      // testEnrollStudents(
      //   unitId: string,
      //   userIds: string[],
      // ): Chainable<Response<any>>;
      // testEnrollLecturers(
      //   unitId: string,
      //   userIds: string[],
      // ): Chainable<Response<any>>;
    }
  }
}

export {};
