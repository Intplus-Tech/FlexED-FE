import DashboardLayout from "@/components/layout/dashbaord";
import { ClassManagementView } from "@/modules/class-management/view";

const ClassManagementPage = () => {
  return (
    <DashboardLayout>
      <ClassManagementView />
    </DashboardLayout>
  );
};

export default ClassManagementPage;
