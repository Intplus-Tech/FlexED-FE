import React from "react";
import Image from 'next/image';

interface AppProps {
  app: {
    id: number;
    title: string;
    description: string;
    price: string;
    status: string;
    tag?: string | null; // The ? means this is optional
  };
}

const AppData = [
  {
    id: 1,
    title: "Admissions & Enrolment Management",
    description: "Streamlining the journey from prospective applicant to enrolled student with automated workflows.",
    price: "₦599/month",
    status: "inactive",
    tag: "Coming Soon"
  },
  {
    id: 2,
    title: "Discipline & Behavior Management",
    description: "Logging incidents, assigning consequences, and tracking patterns to support student conduct.",
    price: "₦599/month",
    status: "inactive",
    tag: "Coming Soon"
  },
  {
    id: 3,
    title: "Grade & Transcript Management",
    description: "The official repository for report cards, historical grades, and the generation of formal transcripts.",
    price: "₦599/month",
    status: "inactive",
    tag: "Coming Soon"
  },
  {
    id: 4,
    title: "Timetabling & Master Scheduling",
    description: "Building conflict-free master schedules that balance teacher, room, and student course requests.",
    price: "₦599/month",
    status: "inactive",
    tag: "Coming Soon"
  },
  {
    id: 5,
    title: "Curriculum Management",
    description: "Aligning lessons, units, and assessments with state and national learning standards.",
    price: "₦599/month",
    status: "inactive",
    tag: "Coming Soon"
  },
  {
    id: 6,
    title: "Admissions & Enrollment Management",
    description: "Streamlining the journey from prospective applicant to enrolled student with automated workflows.",
    price: "₦599/month",
    status: "inactive",
    tag: "Coming Soon"
  },
  {
    id: 7,
    title: "Tuition & Fee Management",
    description: "Configuring complex fee structures, payment plans, and generating automated invoices.",
    price: "Free",
    status: "active",
    tag: null
  },
  {
    id: 8,
    title: "Online Payment Portal",
    description: "Enabling secure online payments for tuition, fees, activities, and more from families.",
    price: "Free",
    status: "active",
    tag: null
  },
  {
    id: 9,
    title: "Accounts Payable & Receivable",
    description: "Managing cash flow by tracking money owed to vendors and money due from various sources.",
    price: "₦599/month",
    status: "inactive",
    tag: "Coming Soon"
  },
  {
    id: 10,
    title: "Payroll Processing",
    description: "Automating salary calculations, tax withholdings, and direct deposits for all staff.",
    price: "₦599/month",
    status: "inactive",
    tag: "Coming Soon"
  },
  {
    id: 11,
    title: "Employee Database & Records",
    description: "A centralized digital filing cabinet for all staff contracts, certifications, and personal information.",
    price: "₦599/month",
    status: "inactive",
    tag: "Coming Soon"
  },
  {
    id: 12,
    title: "Parent Portal",
    description: "A secure, personalized dashboard for families to view grades, fees, and announcements.",
    price: "Free",
    status: "active",
    tag: null
  },
];


const AppCard = ({ app }: AppProps) => {
  return (
    <article>
      {/* Icon Placeholder */}
      <div />

      {/* Content */}
      <div>
        <div>
          <h3>{app.title}</h3>
          <button>
            {app.status === 'active' ? 'Active' : 'Activate'}
          </button>
        </div>

        <p>{app.description}</p>

        <div>
          {app.price}
        </div>
      </div>
    </article>
  );
};

export default function AppView() {
  return (
    <div>
      {/* HEADER: Title and Search Area - ONLY ONCE AT THE TOP */}
      <header>
        <h1>Apps/Tools</h1>
        
        {/* SECTION: Hero Banner - ONLY ONCE */}
        <div className="relative h-[324px] w-full">
          <Image
                src="/images/Apps/back-school-cover-illustration.png"
                alt="Back to school illustration"
                fill
                // width={874}
                // height={323.62}
              />
        </div>

        <div>
          <h2>Apps</h2>
          <div>
            <input type="text" placeholder="Search Apps" />
          </div>
          <select name="status">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </header>

      {/* MAIN: Grid container */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* We call the AppCard blueprint here for every item in AppData */}
        {AppData.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </main>
    </div>
  );
}
