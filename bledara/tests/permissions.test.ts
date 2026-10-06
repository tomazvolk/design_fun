import { describe, expect, it } from "vitest";
import { can, canOnSubscription, PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/permissions";

describe("role permissions", () => {
  it("gives Admin every permission", () => {
    for (const p of PERMISSIONS) expect(can("ADMIN", p)).toBe(true);
  });

  it("keeps settings and audit away from employees and owners", () => {
    expect(can("EMPLOYEE", "settings:manage")).toBe(false);
    expect(can("OWNER", "settings:manage")).toBe(false);
    expect(can("EMPLOYEE", "audit:read")).toBe(false);
  });

  it("lets Finance and IT approve requests but not change roles", () => {
    expect(can("FINANCE", "request:approve")).toBe(true);
    expect(can("IT", "request:approve")).toBe(true);
    expect(can("FINANCE", "settings:manage")).toBe(false);
    expect(can("IT", "settings:manage")).toBe(false);
  });

  it("only lists known permissions in every role", () => {
    const known = new Set<string>(PERMISSIONS);
    for (const list of Object.values(ROLE_PERMISSIONS)) {
      for (const p of list) expect(known.has(p)).toBe(true);
    }
  });
});

describe("owner-scoped permissions", () => {
  const sub = { ownerId: "emp_1" };

  it("lets an owner decide renewals only for their own tool", () => {
    expect(canOnSubscription({ role: "OWNER", employeeId: "emp_1" }, sub, "renewal:decide")).toBe(true);
    expect(canOnSubscription({ role: "OWNER", employeeId: "emp_2" }, sub, "renewal:decide")).toBe(false);
    expect(canOnSubscription({ role: "OWNER", employeeId: null }, sub, "renewal:decide")).toBe(false);
  });

  it("does not scope Finance or IT to ownership", () => {
    expect(canOnSubscription({ role: "FINANCE", employeeId: "emp_9" }, sub, "renewal:decide")).toBe(true);
    expect(canOnSubscription({ role: "IT", employeeId: null }, sub, "card:manage")).toBe(true);
  });

  it("never grants a permission the role lacks, even to the owner", () => {
    expect(canOnSubscription({ role: "OWNER", employeeId: "emp_1" }, sub, "settings:manage")).toBe(false);
  });
});
