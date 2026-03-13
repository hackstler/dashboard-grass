export type Permission =
  | "edit_own_profile"
  | "view_org_users"
  | "edit_org_users"
  | "create_org_users"
  | "delete_org_users"
  | "view_own_org"
  | "edit_own_org"
  | "view_all_orgs"
  | "create_org"
  | "delete_org"
  | "view_knowledge"
  | "manage_knowledge"
  | "view_whatsapp_mgmt"
  | "revoke_whatsapp"
  | "manage_catalogs"
  | "view_quotes"
  | "use_chat"
  | "use_whatsapp_personal";

export type PermissionScope = "own" | "own_org" | "all";
export type Role = "user" | "admin" | "super_admin";

export const ROLE_PERMISSIONS: Record<Role, Array<{ permission: Permission; scope: PermissionScope }>> = {
  user: [
    { permission: "edit_own_profile", scope: "own" },
    { permission: "view_own_org", scope: "own" },
    { permission: "view_quotes", scope: "own_org" },
    { permission: "use_chat", scope: "own_org" },
    { permission: "use_whatsapp_personal", scope: "own_org" },
  ],
  admin: [
    { permission: "edit_own_profile", scope: "own" },
    { permission: "view_org_users", scope: "own_org" },
    { permission: "edit_org_users", scope: "own_org" },
    { permission: "create_org_users", scope: "own_org" },
    { permission: "delete_org_users", scope: "own_org" },
    { permission: "view_own_org", scope: "own" },
    { permission: "edit_own_org", scope: "own" },
    { permission: "view_knowledge", scope: "own_org" },
    { permission: "manage_knowledge", scope: "own_org" },
    { permission: "manage_catalogs", scope: "own_org" },
    { permission: "view_quotes", scope: "own_org" },
    { permission: "use_chat", scope: "own_org" },
    { permission: "use_whatsapp_personal", scope: "own_org" },
  ],
  super_admin: [
    { permission: "edit_own_profile", scope: "all" },
    { permission: "view_org_users", scope: "all" },
    { permission: "edit_org_users", scope: "all" },
    { permission: "create_org_users", scope: "all" },
    { permission: "delete_org_users", scope: "all" },
    { permission: "view_own_org", scope: "all" },
    { permission: "edit_own_org", scope: "all" },
    { permission: "view_all_orgs", scope: "all" },
    { permission: "create_org", scope: "all" },
    { permission: "delete_org", scope: "all" },
    { permission: "view_knowledge", scope: "all" },
    { permission: "manage_knowledge", scope: "all" },
    { permission: "view_whatsapp_mgmt", scope: "all" },
    { permission: "revoke_whatsapp", scope: "all" },
    { permission: "manage_catalogs", scope: "all" },
    { permission: "view_quotes", scope: "all" },
    { permission: "use_chat", scope: "all" },
    { permission: "use_whatsapp_personal", scope: "all" },
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].some((p) => p.permission === permission);
}

export function getPermissionScope(role: Role, permission: Permission): PermissionScope | null {
  const entry = ROLE_PERMISSIONS[role].find((p) => p.permission === permission);
  return entry?.scope ?? null;
}

export function getPermissionSet(role: Role): Set<Permission> {
  return new Set(ROLE_PERMISSIONS[role].map((p) => p.permission));
}

// ── View access control (single source of truth) ────────────────────────────

/**
 * Maps each view to the permission required to access it.
 * Views not listed here are accessible to all authenticated users.
 */
export const VIEW_PERMISSIONS: Record<string, Permission> = {
  chat: "use_chat",
  "knowledge-upload": "manage_knowledge",
  "knowledge-list": "view_knowledge",
  users: "view_org_users",
  organizations: "view_all_orgs",
  catalogs: "manage_catalogs",
  quotes: "view_quotes",
  "whatsapp-connections": "view_whatsapp_mgmt",
};

export function canAccessView(role: Role, view: string): boolean {
  const required = VIEW_PERMISSIONS[view];
  if (!required) return true;
  return hasPermission(role, required);
}
