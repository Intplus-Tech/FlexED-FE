import DashboardLayout from "@/components/layout/dashbaord";
import StudentView from "@/modules/students/view";

const StudentsPage = () => {
  return (
    <DashboardLayout>
      <StudentView />
    </DashboardLayout>
  );
};

export default StudentsPage;
