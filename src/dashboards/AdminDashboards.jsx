import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

const data = [
  { name: "A", value: 400 },
  { name: "B", value: 300 },
  { name: "C", value: 200 },
];

const pieData = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminDashboards = () => {
  const handleClick = (data) => {
    console.log("Clicked:", data);
  };

  const handlePieClick = (data, index) => {
    console.log("Clicked segment:", data, "Index:", index);
    alert(`You clicked on ${data.name} with value ${data.value}`);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <BarChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" onClick={handleClick} />
      </BarChart>
      <PieChart width={400} height={300}>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          onClick={handlePieClick} // Click event here
        >
          {pieData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              cursor="pointer"
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default AdminDashboards;
