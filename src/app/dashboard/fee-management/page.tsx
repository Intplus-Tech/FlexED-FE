import DashboardLayout from "@/components/layout/dashbaord";
import FeeManagementView from "@/modules/fee-management/view";

const FeemanagementPage = () => {
  return (
    <DashboardLayout>
      <FeeManagementView />
    </DashboardLayout>
  );
};

export default FeemanagementPage;
