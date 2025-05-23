import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const transactionData = {
    transaction: [
    { month: "Jan", revenue: 6000000 },
    { month: "Feb", revenue: 8000000 },
    { month: "Mar", revenue: 5000000 },
    { month: "Apr", revenue: 9000000 },
    { month: "May", revenue: 7000000 },
  ],
};


const LatestTransaction = () => {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        background: "#edd28b",
        padding: 16,
        borderRadius: 10,
        width: "100%",
        boxSizing: "border-box",
        minHeight: 200,
        marginTop: 20,
      }}
    >
      <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>
          Latest Transaction
        </div>
        <div style={{ display: "flex", gap: 16, flex: 1 }}>
          <div
            style={{
              background: "#edd28b",
              border: "1px solid #bfae7c",
              borderRadius: 6,
              flex: 4,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              fontSize: 16,
            }}
          >

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={transactionData.transaction} margin={{ top: 5, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) =>
                    `${Number(value).toLocaleString()} ₫`
                  }
                />
                <Legend />
                <Line
                  type="monotone" 
                  dataKey="revenue"
                  stroke="#a47706"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestTransaction;
