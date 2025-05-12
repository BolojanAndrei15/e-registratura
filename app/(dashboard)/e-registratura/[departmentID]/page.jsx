import SectionRegistre from "@/components/section-registre";

export default async function Page({ params }) {
  const { departmentID } = await params;
  return (
    <SectionRegistre departmentId={departmentID} />
  );
}