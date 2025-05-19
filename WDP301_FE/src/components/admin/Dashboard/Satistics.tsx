const fakeData = [
  {
    title: "Tổng doanh thu ngày",
    value: "12,500,000₫",
    filter: "Today",
  },
  {
    title: "Số lượng đơn",
    value: "120",
    filter: "This Month",
  },
  {
    title: "Các món ăn bán chạy",
    value: "Phở bò, Bún chả, Cơm tấm",
    filter: "Top 3",
  },
  {
    title: "Trung bình mỗi đơn hàng",
    value: "104,167₫",
    filter: "Today",
  },
];

const Satistics = () => (
  <div>
    <h1 style={{ fontWeight: "bold", color: "#da7339", marginTop:0 }}>Dashboard</h1>
    <h2 style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>Welcome ___{`{name}`}___
    <button
        style={{
          border: "1px solid #333",
          borderRadius: 20,
          padding: "8px 24px",
          background: "white",
          fontWeight: "bold",
        }}
      >
        Filter + Export to PDF/Excel
      </button>
    </h2>
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
    </div>
    <div style={{ display: "flex", gap: 24 }}>
      {fakeData.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: "#edd28b",
            borderRadius: 10,
            padding: 24,
            minWidth: 220,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px #0001",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4 }}>
            {item.title}
          </div>
          <div style={{ fontSize: 22, marginBottom: 6 }}>{item.value}</div>
          <div style={{ fontWeight: "bold", color: "#6b4f1d" }}>{item.filter}</div>
        </div>
      ))}
    </div>
  </div>
);

export default Satistics;