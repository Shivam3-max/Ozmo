import { requireStaff } from "@/lib/auth";
import { PageTitle, Panel, Empty } from "@/components/admin/ui";

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageTitle title="Clients" sub="Specified in the planning docs — next in the build queue." />
      <Panel>
        <Empty
          title="Not built yet"
          body="Leads, assessments, enquiries and the food database are live. Clients is next."
        />
      </Panel>
    </>
  );
}
