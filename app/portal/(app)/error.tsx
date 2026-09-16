"use client";

import ErrorPanel from "@/components/ErrorPanel";

export default function PortalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel digest={error.digest} retry={retry} home="/portal" homeLabel="Back to today" />;
}
