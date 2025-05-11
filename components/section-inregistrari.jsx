import { DataTable } from "./data-table";
import data from "../data.json"; // Assuming you have a data.json file with your data
export default function SectionInregistrari({ params }) {
    return (
        <DataTable data={data} />
    );
}