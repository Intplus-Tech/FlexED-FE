import React from "react";

const AppView = () => {
  const service = [
    {
      id: 1,
      name: "Admission",
      description: "Automated admission and enrollment process.",
    },
    {
      id: 2,
      name: "Fee Management",
      description: "Efficient fee management and collection.",
    },
    {
      id: 3,
      name: "Attendance Tracking",
      description: "Real-time attendance tracking and monitoring.",
    },
    {
      id: 4,
      name: "Leave Management",
      description: "Efficient leave management and approval.",
    },
    {
      id: 5,
      name: "Time Management",
      description: "Efficient time management and scheduling.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {service.map((item, index) => (
        <div key={index} className="bg-[#F8F8F8] max-w-[370px] border-md p-4">
          <h1 className="font-bold text-2xl py-2">{item.name}</h1>
          <p className="bg-[#F8F8F8] max-w-[370px]">{item.description}</p>
        </div>
      ))}
    </div>
  );
};

export default AppView;
