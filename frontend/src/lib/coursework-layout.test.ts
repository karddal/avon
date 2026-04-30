import { describe, expect, it } from "vitest";

import {
  defaultStaffCourseworkLayout,
  defaultStudentCourseworkLayout,
  isValidGridItem,
  parseCourseworkLayout,
  staffAvailableModules,
  studentAvailableModules,
} from "./coursework-layout";

describe("coursework-layout", () => {
  it("keeps default staff and student modules available", () => {
    expect(staffAvailableModules).toEqual(
      expect.arrayContaining(
        defaultStaffCourseworkLayout.map((item) => item.moduleKey),
      ),
    );
    expect(studentAvailableModules).toEqual(
      expect.arrayContaining(
        defaultStudentCourseworkLayout.map((item) => item.moduleKey),
      ),
    );
  });

  it("parses valid layouts", () => {
    expect(
      parseCourseworkLayout(JSON.stringify(defaultStaffCourseworkLayout)),
    ).toEqual(defaultStaffCourseworkLayout);
  });

  it("rejects invalid JSON, non-arrays, unknown modules, and out-of-bounds items", () => {
    expect(parseCourseworkLayout(undefined)).toBeNull();
    expect(parseCourseworkLayout("not-json")).toBeNull();
    expect(parseCourseworkLayout(JSON.stringify({}))).toBeNull();
    expect(
      parseCourseworkLayout(
        JSON.stringify([
          defaultStaffCourseworkLayout[0],
          { ...defaultStaffCourseworkLayout[1], moduleKey: "missing-module" },
        ]),
      ),
    ).toBeNull();
    expect(
      parseCourseworkLayout(
        JSON.stringify([{ ...defaultStaffCourseworkLayout[0], x: 2, w: 2 }]),
      ),
    ).toBeNull();
  });

  it("validates required grid dimensions", () => {
    expect(isValidGridItem(defaultStaffCourseworkLayout[0])).toBe(true);
    expect(isValidGridItem(null)).toBe(false);
    expect(isValidGridItem({ ...defaultStaffCourseworkLayout[0], w: 0 })).toBe(
      false,
    );
    expect(isValidGridItem({ ...defaultStaffCourseworkLayout[0], y: -1 })).toBe(
      false,
    );
  });
});
