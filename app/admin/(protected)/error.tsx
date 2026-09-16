"use client";

import ErrorPanel from "@/components/ErrorPanel";

export default function PracticeError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel digest={error.digest} retry={retry} home="/admin" homeLabel="Back to overview" />;
}
