import { requireStaff } from "@/lib/auth";
import { PageTitle, Panel, Empty } from "@/components/admin/ui";

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageTitle title="Appointments" sub="Specified in the planning docs — next in the build queue." />
      <Panel>
        <Empty
          title="Not built yet"
          body="Leads, assessments, enquiries and the food database are live. Appointments is next."
        />
      </Panel>
    </>
  );
}
