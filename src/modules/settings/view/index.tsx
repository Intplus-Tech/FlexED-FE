"use client";

import { useState } from "react";
import { SchoolInformationTab } from "../components/school-information";
import { PaymentSettingsTab } from "../components/payment-setting";
import { TeamSettingsTab } from "../components/team-settings";
import { SecuritySettingsTab } from "../components/security-settings";

type TabType = "school" | "payment" | "team" | "security";

interface Tab {
  id: TabType;
  label: string;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  {
    id: "school",
    label: "School Information",
    component: SchoolInformationTab,
  },
  { id: "payment", label: "Payment Settings", component: PaymentSettingsTab },
  { id: "team", label: "Team Settings", component: TeamSettingsTab },
  {
    id: "security",
    label: "Security Settings",
    component: SecuritySettingsTab,
  },
];

export default function SeettingsView() {
  const [activeTab, setActiveTab] = useState<TabType>("school");

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-purple-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-4">{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
}
