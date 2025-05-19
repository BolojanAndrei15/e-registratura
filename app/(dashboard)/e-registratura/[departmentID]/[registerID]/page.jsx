import SectionInregistrari from "@/components/section-inregistrari";

export default async function Page({ params }) {
    const { departmentID, registerID } = await params;
    return (
        <SectionInregistrari departmentId={departmentID} registerId={registerID} />
    );
}