"use client";

/**
 * The prototype's "backend": demo data plus a small mutable slice (session, organisation,
 * members, invited people, audit log) kept in this browser's localStorage. Nothing leaves
 * the browser. The database version replaces this module with server actions and Prisma.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuditEntry, Dataset, Employee, Membership, Organisation, Role, User } from "@/data/types";
import { DEMO_ORG, DEMO_PASSWORD, EMPTY_DATASET, buildDemo } from "@/data/demo";
import { can as roleCan, type Permission } from "./permissions";
import { slugify } from "./format";

const STORAGE_KEY = "bledara-prototype-v1";

type Persisted = {
  session: { userId: string } | null;
  dataset: "demo" | "empty";
  org: Organisation;
  users: User[];
  memberships: Membership[];
  extraEmployees: Employee[];
  audit: AuditEntry[];
  justCreated: boolean;
};

export type Result = { ok: true; message?: string } | { ok: false; error: string; field?: string };

export type SessionUser = User & { role: Role; membershipId: string; employeeId: string | null };

type Store = {
  ready: boolean;
  session: SessionUser | null;
  org: Organisation;
  data: Dataset;
  employees: Employee[];
  members: (Membership & { user: User })[];
  audit: AuditEntry[];
  justCreated: boolean;
  dismissCreated: () => void;
  can: (permission: Permission) => boolean;
  signIn: (email: string, password: string) => Result;
  signOut: () => void;
  signUp: (input: { name: string; email: string; password: string; orgName: string }) => Result;
  updateOrganisation: (input: { name: string; currency: string }) => Result;
  updateMemberRole: (membershipId: string, role: Role) => Result;
  inviteMember: (input: { name: string; email: string; role: Role }) => Result;
  removeMember: (membershipId: string) => Result;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

let demoCache: Dataset | null = null;
function demo() {
  return (demoCache ??= buildDemo());
}

function initial(): Persisted {
  const d = demo();
  return { session: null, dataset: "demo", org: DEMO_ORG, users: d.users, memberships: d.memberships, extraEmployees: [], audit: d.audit, justCreated: false };
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return { ...initial(), ...parsed };
  } catch {
    return initial();
  }
}

const id = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted | null>(null);

  useEffect(() => {
    // Read once after hydration; the server-rendered HTML is the loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(load());
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode or blocked storage: the session simply does not persist */
    }
  }, [state]);

  const update = useCallback((fn: (s: Persisted) => Persisted) => setState((s) => (s ? fn(s) : s)), []);

  const value = useMemo<Store>(() => {
    const s = state ?? initial();
    const data = s.dataset === "demo" ? demo() : EMPTY_DATASET;
    const baseEmployees = s.dataset === "demo" ? data.employees : [];
    const employees = [...baseEmployees, ...s.extraEmployees];
    const members = s.memberships
      .map((m) => ({ ...m, user: s.users.find((u) => u.id === m.userId)! }))
      .filter((m) => m.user);

    let session: SessionUser | null = null;
    if (s.session) {
      const user = s.users.find((u) => u.id === s.session!.userId);
      const membership = user && s.memberships.find((m) => m.userId === user.id);
      if (user && membership) {
        session = { ...user, role: membership.role, membershipId: membership.id, employeeId: employees.find((e) => e.userId === user.id)?.id ?? null };
      }
    }

    const record = (st: Persisted, actor: SessionUser, entry: Omit<AuditEntry, "id" | "createdAt" | "actorName" | "actorEmail">): Persisted => ({
      ...st,
      audit: [{ id: `audit-${id()}`, createdAt: now(), actorName: actor.name, actorEmail: actor.email, ...entry }, ...st.audit],
    });

    const requireManage = (): Result | null => {
      if (!session) return { ok: false, error: "Sign in first." };
      if (!roleCan(session.role, "settings:manage")) return { ok: false, error: "You do not have permission to do that." };
      return null;
    };

    return {
      ready: state !== null,
      session,
      org: s.org,
      data,
      employees,
      members,
      audit: s.audit,
      justCreated: s.justCreated,
      dismissCreated: () => update((st) => ({ ...st, justCreated: false })),
      can: (p) => (session ? roleCan(session.role, p) : false),

      signIn: (email, password) => {
        const user = s.users.find((u) => u.email === email.trim().toLowerCase());
        const ok = user && (password === DEMO_PASSWORD || password === (user as User & { password?: string }).password);
        if (!ok) return { ok: false, error: "That email and password do not match." };
        update((st) => ({ ...st, session: { userId: user.id } }));
        return { ok: true };
      },

      signOut: () => update((st) => ({ ...st, session: null })),

      signUp: ({ name, email, password, orgName }) => {
        const e = email.trim().toLowerCase();
        if (s.users.some((u) => u.email === e)) return { ok: false, error: "An account with that email already exists. Sign in instead.", field: "email" };
        if (password.length < 8) return { ok: false, error: "Use at least 8 characters.", field: "password" };
        const userId = `user-${id()}`;
        const user: User & { password: string } = { id: userId, name: name.trim(), email: e, password };
        const base = slugify(orgName) || "org";
        const org: Organisation = { id: `org-${id()}`, name: orgName.trim(), slug: base, currency: "EUR", inboxAddress: `invoices-${base}@in.bledara.app`, createdAt: now() };
        const membership: Membership = { id: `mem-${id()}`, userId, role: "ADMIN", createdAt: now() };
        const employee: Employee = { id: `emp-${id()}`, userId, name: user.name, email: e, title: null, teamId: null, status: "ACTIVE", startDate: now() };
        update(() => ({
          session: { userId },
          dataset: "empty",
          org,
          users: [user],
          memberships: [membership],
          extraEmployees: [employee],
          audit: [{ id: `audit-${id()}`, createdAt: now(), actorName: user.name, actorEmail: e, action: "organisation.created", entityType: "Organisation", entityId: org.id, summary: `${user.name} created ${org.name}.` }],
          justCreated: true,
        }));
        return { ok: true };
      },

      updateOrganisation: ({ name, currency }) => {
        const denied = requireManage();
        if (denied) return denied;
        const n = name.trim();
        if (n.length < 2) return { ok: false, error: "Give the organisation a name.", field: "name" };
        if (n === s.org.name && currency === s.org.currency) return { ok: true, message: "Nothing changed." };
        update((st) => record({ ...st, org: { ...st.org, name: n, currency } }, session!, {
          action: "organisation.updated",
          entityType: "Organisation",
          entityId: st.org.id,
          summary: `Organisation settings changed: ${st.org.name} / ${st.org.currency} → ${n} / ${currency}.`,
        }));
        return { ok: true, message: "Saved." };
      },

      updateMemberRole: (membershipId, role) => {
        const denied = requireManage();
        if (denied) return denied;
        const m = members.find((x) => x.id === membershipId);
        if (!m) return { ok: false, error: "That member is no longer in the organisation." };
        if (m.role === role) return { ok: true, message: "Nothing changed." };
        if (m.role === "ADMIN" && members.filter((x) => x.role === "ADMIN").length <= 1) return { ok: false, error: "Keep at least one admin in the organisation." };
        update((st) => record({ ...st, memberships: st.memberships.map((x) => (x.id === membershipId ? { ...x, role } : x)) }, session!, {
          action: "member.role_changed",
          entityType: "Membership",
          entityId: membershipId,
          summary: `${m.user.name} is now ${role.toLowerCase()} (was ${m.role.toLowerCase()}).`,
        }));
        return { ok: true, message: `${m.user.name} is now ${role.toLowerCase()}.` };
      },

      inviteMember: ({ name, email, role }) => {
        const denied = requireManage();
        if (denied) return denied;
        const e = email.trim().toLowerCase();
        const n = name.trim();
        if (n.length < 2) return { ok: false, error: "Enter their name.", field: "name" };
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return { ok: false, error: "Enter a valid email address.", field: "email" };
        if (s.users.some((u) => u.email === e)) return { ok: false, error: "They are already a member.", field: "email" };
        const userId = `user-${id()}`;
        const user: User & { password: string } = { id: userId, name: n, email: e, password: DEMO_PASSWORD };
        const membership: Membership = { id: `mem-${id()}`, userId, role, createdAt: now() };
        const existing = employees.find((x) => x.email === e);
        update((st) =>
          record(
            {
              ...st,
              users: [...st.users, user],
              memberships: [...st.memberships, membership],
              extraEmployees: existing
                ? st.extraEmployees
                : [...st.extraEmployees, { id: `emp-${id()}`, userId, name: n, email: e, title: null, teamId: null, status: "ONBOARDING", startDate: now() }],
            },
            session!,
            { action: "member.invited", entityType: "Membership", entityId: membership.id, summary: `${n} (${e}) invited as ${role.toLowerCase()}.` },
          ),
        );
        return { ok: true, message: `${n} added as ${role.toLowerCase()}. In the prototype they can sign in with the demo password.` };
      },

      removeMember: (membershipId) => {
        const denied = requireManage();
        if (denied) return denied;
        const m = members.find((x) => x.id === membershipId);
        if (!m) return { ok: false, error: "That member is no longer in the organisation." };
        if (m.userId === session!.id) return { ok: false, error: "You cannot remove yourself." };
        if (m.role === "ADMIN" && members.filter((x) => x.role === "ADMIN").length <= 1) return { ok: false, error: "Keep at least one admin in the organisation." };
        update((st) => record({ ...st, memberships: st.memberships.filter((x) => x.id !== membershipId) }, session!, {
          action: "member.removed",
          entityType: "Membership",
          entityId: membershipId,
          summary: `${m.user.name} (${m.user.email}) removed from the organisation.`,
        }));
        return { ok: true, message: `${m.user.name} removed.` };
      },

      resetDemo: () => setState(initial()),
    };
  }, [state, update]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
