import DashboardLayout from "@/components/layout/dashbaord";
import AcademicSessionView from "@/modules/academic-session/view";
import FeeManagementView from "@/modules/fee-management/view";

const FeemanagementPage = () => {
  return (
    <DashboardLayout>
      <AcademicSessionView />
    </DashboardLayout>
  );
};

export default FeemanagementPage;
