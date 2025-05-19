import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Select } from "antd";

const dataSample = {
  all: [
    { month: "Jan", revenue: 12000000 },
    { month: "Feb", revenue: 13500000 },
    { month: "Mar", revenue: 11000000 },
  ],
  branchA: [
    { month: "Jan", revenue: 6000000 },
    { month: "Feb", revenue: 8000000 },
    { month: "Mar", revenue: 5000000 },
  ],
  branchB: [
    { month: "Jan", revenue: 6000000 },
    { month: "Feb", revenue: 5500000 },
    { month: "Mar", revenue: 6000000 },
  ],
};

type BranchType = keyof typeof dataSample;

const EarningsChart = ({ branch }: { branch: BranchType }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={dataSample[branch]}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip
        formatter={(value: any) =>
          new Intl.NumberFormat().format(Number(value)) + " ₫"
        }
      />
      <Bar dataKey="revenue" fill="#a47706" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

const salesData = [
  { name: "Online", value: 4000000 },
  { name: "Offline", value: 5000000 },
  { name: "Marketing", value: 3000000 },
];

const COLORS = ["#78a243", "#da7339", "#2d1e1a"];

const SalesAnalytics = () => (
  <>
    <div style={{ fontWeight: "bold", marginBottom: 8 }}>Sales Analytics</div>
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={salesData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label={false}
        >
          {salesData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend verticalAlign="bottom" height={20} />
        <Tooltip formatter={(value: any) => `${value.toLocaleString()} ₫`} />
      </PieChart>
    </ResponsiveContainer>
  </>
);

const MonthlyEarnings = () => {
  const [branch, setBranch] = useState<BranchType>("all");

  const currentMonthRevenue = dataSample[branch]?.[2]?.revenue || 0;
  const lastMonthRevenue = dataSample[branch]?.[1]?.revenue || 0;

  return (
    <div style={{ display: "flex", gap: 12, paddingTop: 20 }}>
      <div
        style={{
          display: "flex",
          gap: 24,
          background: "#edd28b",
          padding: 16,
          borderRadius: 10,
          width: "75.5%",
          boxSizing: "border-box",
          minHeight: 200,
        }}
      >
        <div
          style={{ flex: 2, display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>
            Monthly Earnings
          </div>
          <div style={{ display: "flex", gap: 16, flex: 1 }}>
            <div
              style={{
                background: "#edd28b",
                border: "1px solid #bfae7c",
                borderRadius: 6,
                flex: 5,
                padding: 16,
                paddingLeft: 10,
                display: "flex",
                flexDirection: "column",
                fontSize: 13,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <Select
                  defaultValue="all"
                  style={{ width: 180 }}
                  onChange={(value) => setBranch(value as BranchType)}
                  options={[
                    { value: "all", label: "Tất cả chi nhánh" },
                    { value: "branchA", label: "Chi nhánh A" },
                    { value: "branchB", label: "Chi nhánh B" },
                  ]}
                />
              </div>
              <EarningsChart branch={branch} />
            </div>
            <div
              style={{
                background: "#edd28b",
                border: "1px solid #bfae7c",
                borderRadius: 6,
                flex: 1,
                padding: 16,
                fontWeight: "bold",
                fontSize: 16,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              {`This Month: ${currentMonthRevenue.toLocaleString()} ₫`}
            </div>
            <div
              style={{
                background: "#edd28b",
                border: "1px solid #bfae7c",
                borderRadius: 6,
                flex: 1,
                padding: 16,
                fontWeight: "bold",
                fontSize: 16,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              {`Last Month: ${lastMonthRevenue.toLocaleString()} ₫`}
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ tròn phân tích Sales */}
      <div
        style={{
          flex: 1,
          background: "#edd28b",
          borderRadius: 10,
          padding: 16,
          minWidth: 220,
          boxSizing: "border-box",
          width: "24.5%",
        }}
      >
        <SalesAnalytics />
      </div>
    </div>
  );
};

export default MonthlyEarnings;
