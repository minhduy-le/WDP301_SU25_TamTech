const MonthlyEarnings = () => {
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
      <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>
          Monthly Earnings 
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
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>Chart + Filter</div>
            <div>
              <p>
                Là doanh thu chỗ này, filter tổng/từng chi nhánh, hiện chart rồi hiện so sánh tháng này, tháng trước đúng ko
              </p>
              <p>
                t định hiện barchart lun á để track dc dài hạn chi nhánh đó nè
              </p>
            </div>
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
            }}
          >
            This Month
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
            }}
          >
            Last Month
          </div>
        </div>
      </div>
    </div>
    <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      background: "#edd28b",
      borderRadius: 10,
      padding: 16,
      minWidth: 220,
      boxSizing: "border-box",
      width: "24.5%",
    }}
  >
    <div style={{ fontWeight: "bold", marginBottom: 8 }}>Sales Analytics</div>
    <div
      style={{
        background: "#edd28b",
        border: "1px solid #bfae7c",
        borderRadius: 6,
        padding: 12,
        marginBottom: 8,
      }}
    >
      Online
    </div>
    <div
      style={{
        background: "#edd28b",
        border: "1px solid #bfae7c",
        borderRadius: 6,
        padding: 12,
        marginBottom: 8,
      }}
    >
      Offline
    </div>
    <div
      style={{
        background: "#edd28b",
        border: "1px solid #bfae7c",
        borderRadius: 6,
        padding: 12,
      }}
    >
      Marketing?
    </div>
  </div>
  </div>
  );
};

export default MonthlyEarnings;
