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
        </div>
      </div>
    </div>
    )
}

export default LatestTransaction;