import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getLiasoningData } from "../toolkit/slices/dashboardSlice.js"; // adjust path
import {
  Briefcase,
  IndianRupee,
  Loader2,
  TrendingUp,
  LayoutGrid,
} from "lucide-react"; // swap icon set if different
import { useParams } from "react-router-dom";

const STATUS_COLORS = [
  "#4F46E5", // indigo
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#0EA5E9", // sky
  "#8B5CF6", // violet
];

function formatCurrency(value) {
  if (value === null || value === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function KpiCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, dotColor, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function LiasoningDashboard() {
  const dispatch = useDispatch();

  // Adjust these selector paths to match your actual store shape
  const { liasoningData, loading } = useSelector((state) => state.dashboard);
  const { userId } = useParams();

  useEffect(() => {
    if (userId) {
      dispatch(getLiasoningData({ userId }));
    }
  }, [dispatch, userId]);

  const statusSummaries = liasoningData?.statusSummaries || [];

  const barChartData = useMemo(
    () =>
      statusSummaries.map((s) => ({
        status: s.statusName,
        count: s.projectCount,
      })),
    [statusSummaries],
  );

  const pieChartData = useMemo(
    () =>
      statusSummaries
        .filter((s) => s.totalAmount > 0)
        .map((s) => ({
          name: s.statusName,
          value: s.totalAmount,
        })),
    [statusSummaries],
  );

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-sm">Loading Liaisoning dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <LayoutGrid size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Liaisoning Dashboard</h1>
            <p className="text-sm text-indigo-100">
              Overview of projects currently in the Liaisoning milestone
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          label="Total Projects"
          value={liasoningData?.totalProjects ?? 0}
          icon={Briefcase}
          accent="#4F46E5"
        />
        <KpiCard
          label="Total Project Amount"
          value={formatCurrency(liasoningData?.totalProjectAmount)}
          icon={IndianRupee}
          accent="#10B981"
        />
      </div>

      {/* Charts */}
      {statusSummaries.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 text-gray-400">
          <TrendingUp size={28} className="text-gray-300" />
          <p className="text-sm">No Liaisoning milestone data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Projects by status */}
          <ChartCard title="Projects by Status" dotColor="#4F46E5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  cursor={{ fill: "#F8FAFC" }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 13,
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#4F46E5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Amount distribution by status */}
          <ChartCard title="Amount Distribution by Status" dotColor="#10B981">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 13,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Status breakdown table */}
      {statusSummaries.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Status Breakdown
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Projects</th>
                <th className="px-5 py-3 font-medium">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statusSummaries.map((s, index) => (
                <tr
                  key={s.statusName}
                  className="transition-colors hover:bg-gray-50/70"
                >
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2 font-medium text-gray-900">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[index % STATUS_COLORS.length],
                        }}
                      />
                      {s.statusName}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{s.projectCount}</td>
                  <td className="px-5 py-3 font-medium text-gray-700">
                    {formatCurrency(s.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LiasoningDashboard;
