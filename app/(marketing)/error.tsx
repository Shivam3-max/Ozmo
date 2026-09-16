"use client";

import ErrorPanel from "@/components/ErrorPanel";

export default function MarketingError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel digest={error.digest} retry={retry} home="/" homeLabel="Go to the home page" />;
}
