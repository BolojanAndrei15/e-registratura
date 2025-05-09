import SectionRegistre from "@/components/section-registre";

export default function Page({ params }) {
    return (
        <SectionRegistre departmentId={params.departmentID} />
    );
}