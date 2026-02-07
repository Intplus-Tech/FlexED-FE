import DashboardLayout from "@/components/layout/dashbaord";
import DashboardView from "@/modules/overview/view";
import React from "react";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <DashboardView />
    </DashboardLayout>
  );
};

export default DashboardPage;
