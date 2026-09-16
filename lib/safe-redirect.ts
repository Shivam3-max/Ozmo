/** Accept only an internal path on the expected authenticated surface. */
export function safeRedirectPath(value: string | null, root: "/admin" | "/portal") {
  if (!value) return root;
  if (!value.startsWith(`${root}/`) && value !== root) return root;
  if (value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return root;
  return value;
}
