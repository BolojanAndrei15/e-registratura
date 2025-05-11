import SectionInregistrari from "@/components/section-inregistrari";

export default function Page({ params }) {  
    return (
        <SectionInregistrari departmentId={params.departmentID} registerId={params.registerID} />
    );
}