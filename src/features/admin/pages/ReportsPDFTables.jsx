
import { forwardRef } from "react";
const ReportsPDFTables = forwardRef(
    ({ stats, employeeDeliveries, employeeSatisfaction }, ref) => (
        <div ref={ref} style={{ display: "none" }}>
            {/* tus tablas normales */}
        </div>
    )
);

export default ReportsPDFTables;
