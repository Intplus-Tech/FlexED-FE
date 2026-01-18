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
      <div className="">
        {/* App image / loge */}
      </div>

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
    <div className="max-w-[874px]">
      
      <section>
        <h1 className="text-xl font-bold">Apps/Tools</h1>
        
        <div className="relative h-[324px] w-full my-[27px]">
          <Image
                src="/images/Apps/back-school-cover-illustration.png"
                alt="Back to school illustration"
                fill
              />
        </div>

        <div className="flex justify-between items-center gap-4 mb-4">
          <h2 className="text-[clamp(10px, 0.169vw + 10px, 12.44px)] font-bold flex-none">Apps</h2>
          <div className="relative flex-1 min-w-0 max-w-82">
            <input
              type="text"
              placeholder="Search Apps"
              className="pl-10 pr-[7.11px] py-[7.11px] w-full rounded-[21.33px] bg-[#f3f3f3] border-[#c8c8c8] border-[0.89px] placeholder-[#6f6d6d]"
            />
            <Image
              src="/images/Apps/search-icon.svg"
              alt="Search"
              width={24}
              height={24}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>
          <select name="status" className="w-fit p-[3.56px] border-[#c8c8c8] border-[0.89px] rounded-[7.11px]">
            <option value="all">All</option>
          </select>
        </div>
      </section>

      <article className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {AppData.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </article>
    </div>
  );
}
