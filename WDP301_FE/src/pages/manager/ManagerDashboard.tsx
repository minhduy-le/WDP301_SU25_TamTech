import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Tag,
  List,
  Avatar,
  Select,
  Button,
} from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  TrophyOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import type { TooltipProps } from "recharts";

const { Title, Text } = Typography;

const days = Array.from({ length: 30 }, (_, i) => i + 1);
const lastMonthData = days.map((day) => ({
  day: `Ngày ${day}`,
  revenue: Math.floor(800000 + Math.random() * 400000),
  orders: Math.floor(20 + Math.random() * 10),
}));
const thisMonthData = days.map((day) => ({
  day: `Ngày ${day}`,
  revenue: Math.floor(1000000 + Math.random() * 500000),
  orders: Math.floor(25 + Math.random() * 15),
}));
const chartData = days.map((day) => ({
  day: `Ngày ${day}`,
  "Doanh thu tháng trước": lastMonthData[day - 1].revenue,
  "Doanh thu tháng này": thisMonthData[day - 1].revenue,
  "Đơn hàng tháng trước": lastMonthData[day - 1].orders,
  "Đơn hàng tháng này": thisMonthData[day - 1].orders,
}));
const totalLastMonth = lastMonthData.reduce((sum, d) => sum + d.revenue, 0);
const totalThisMonth = thisMonthData.reduce((sum, d) => sum + d.revenue, 0);
const totalOrdersLastMonth = lastMonthData.reduce(
  (sum, d) => sum + d.orders,
  0
);
const totalOrdersThisMonth = thisMonthData.reduce(
  (sum, d) => sum + d.orders,
  0
);
const percentChangeRevenue =
  ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;
const percentChangeOrders =
  ((totalOrdersThisMonth - totalOrdersLastMonth) / totalOrdersLastMonth) * 100;

const totalProductsSold = 320;
const percentChangeProducts = 8;

const topProducts = [
  { name: "Sữa tắm Dove", sold: 120, revenue: 2400000 },
  { name: "Dầu gội Clear", sold: 95, revenue: 1900000 },
  { name: "Bánh Oreo", sold: 80, revenue: 800000 },
  { name: "Sữa tươi Vinamilk", sold: 75, revenue: 1125000 },
  { name: "Snack Lay's", sold: 60, revenue: 600000 },
  { name: "Snack Lay's", sold: 60, revenue: 600000 },
];

const recentOrders = [
  {
    id: "ORD001",
    customer: "Nguyễn Văn A",
    product: "Sữa tắm Dove",
    status: "Thành công",
    amount: 200000,
  },
  {
    id: "ORD002",
    customer: "Trần Thị B",
    product: "Dầu gội Clear",
    status: "Đang xử lý",
    amount: 150000,
  },
  {
    id: "ORD003",
    customer: "Lê Văn C",
    product: "Bánh Oreo",
    status: "Thành công",
    amount: 80000,
  },
  {
    id: "ORD004",
    customer: "Phạm Thị D",
    product: "Sữa tươi Vinamilk",
    status: "Hủy",
    amount: 120000,
  },
  {
    id: "ORD005",
    customer: "Vũ Văn E",
    product: "Snack Lay's",
    status: "Thành công",
    amount: 60000,
  },
];

const orderStatusColors: { [key: string]: string } = {
  "Thành công": "#A05A2C",
  "Đang xử lý": "#D97B41",
  Hủy: "#faad14",
};

const currentYear = new Date().getFullYear();
const startYear = 2025;

const yearList: number[] = [];
for (let y = startYear; y <= currentYear; y++) {
  yearList.push(y);
}

const monthlyRevenueData: {
  [year: number]: { month: string; revenue: number }[];
} = {};
yearList.forEach((year) => {
  monthlyRevenueData[year] = Array.from({ length: 12 }, (_, i) => ({
    month: `Tháng ${i + 1}`,
    revenue: Math.floor(20000000 + Math.random() * 25000000),
  }));
});

const customerTypeData = [
  { name: 'Mang đi', value: 120 },
  { name: 'Ăn tại chỗ', value: 180 },
  { name: 'Đặt online', value: 60 },
];
const customerTypeColors = ['#D97B41', '#A05A2C', '#faad14'];

const renderCustomerTypeLabel = ({ cx, cy, midAngle, outerRadius, value }: { cx: number, cy: number, midAngle: number, outerRadius: number, value: number }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#A05A2C" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={15} fontWeight={600}>
      {value}
    </text>
  );
};

// Custom tooltip cho Pie chart hình thức mua hàng
const CustomCustomerTypeTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 10, color: '#A05A2C', fontWeight: 600, fontSize: 15 }}>
        {name}: {value} lượt
      </div>
    );
  }
  return null;
};

const ManagerDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const averageOrderValue =
    totalOrdersThisMonth > 0 ? totalThisMonth / totalOrdersThisMonth : 0;

  return (
    <div style={{ padding: 32, background: "#FFF9F0", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title
          level={2}
          style={{ margin: 0, fontWeight: 700, color: "#A05A2C", fontSize: 40 }}
        >
          Dashboard
        </Title>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          style={{ background: "#D97B41", borderColor: "#D97B41" }}
        >
          Xuất báo cáo
        </Button>
      </div>

      {/* Quick Stats */}
      <style>{`
        /* Màu border và shadow khi focus vào Select */
        .ant-select-focused .ant-select-selector,
        .ant-select-selector:focus,
        .ant-select-selector:active {
          border-color: #D97B41 !important;
          box-shadow: 0 0 0 2px #F9E4B7 !important;
        }
        /* Màu option được chọn */
        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #F9E4B7 !important;
          color: #D97B41 !important;
        }
        /* Màu option hover */
        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: #F9E4B7 !important;
          color: #D97B41 !important;
        }
        /* Màu border Select khi hover */
        .ant-select-selector:hover {
          border-color: #D97B41 !important;
        }
        /* Màu icon dropdown */
        .ant-select-arrow {
          color: #D97B41 !important;
        }
      `}</style>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(160,90,44,0.08)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#A05A2C", fontWeight: 600 }}>
                  Doanh thu tháng này
                </span>
              }
              value={totalThisMonth}
              valueStyle={{ color: "#D97B41", fontWeight: 700 }}
              prefix={<DollarOutlined />}
              precision={0}
              groupSeparator=","
            />
            <Text type={percentChangeRevenue >= 0 ? "success" : "warning"}>
              {percentChangeRevenue >= 0 ? "+" : ""}
              {percentChangeRevenue.toFixed(2)}% so với tháng trước
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(160,90,44,0.08)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#A05A2C", fontWeight: 600 }}>
                  Đơn hàng tháng này
                </span>
              }
              value={totalOrdersThisMonth}
              valueStyle={{ color: "#A05A2C", fontWeight: 700 }}
              prefix={<ShoppingOutlined />}
              precision={0}
              groupSeparator=","
            />
            <Text type={percentChangeOrders >= 0 ? "success" : "warning"}>
              {percentChangeOrders >= 0 ? "+" : ""}
              {percentChangeOrders.toFixed(2)}% so với tháng trước
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(160,90,44,0.08)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#A05A2C", fontWeight: 600 }}>
                  Giá trị đơn trung bình
                </span>
              }
              value={averageOrderValue}
              valueStyle={{ color: "#D97B41", fontWeight: 700 }}
              prefix={<DollarOutlined />}
              suffix="đ"
              precision={0}
              groupSeparator=","
            />
            <Text type="secondary" style={{color: "#A05A2C"}}>Mỗi đơn hàng trong tháng này</Text>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(160,90,44,0.08)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#A05A2C", fontWeight: 600 }}>
                  Sản phẩm bán ra
                </span>
              }
              value={totalProductsSold}
              valueStyle={{ color: "#faad14", fontWeight: 700 }}
              prefix={<ShoppingOutlined />}
              precision={0}
              groupSeparator=","
            />
            <Text type={percentChangeProducts >= 0 ? "success" : "warning"}>
              +{percentChangeProducts}% so với tháng trước
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24} lg={17}>
          {/* Biểu đồ so sánh 2 tháng */}
          <Card
            title={
              <span style={{ color: "#A05A2C", fontWeight: 700, fontSize: 20 }}>
                So sánh doanh thu & đơn hàng
              </span>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 6px 24px rgba(160,90,44,0.10)",
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={chartData}
                margin={{ top: 24, right: 24, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => v.toLocaleString()}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(v) => v.toLocaleString()} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Doanh thu tháng trước"
                  stroke="#A05A2C"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Doanh thu tháng này"
                  stroke="#D97B41"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Đơn hàng tháng trước"
                  stroke="#faad14"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Đơn hàng tháng này"
                  stroke="#A05A2C"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title={
              <span style={{ color: "#222", fontWeight: 700 }}>
                Báo cáo doanh thu năm {selectedYear}
              </span>
            }
            bordered={false}
            style={{
              borderRadius: 16,
              background: "#fff",
              marginTop: 32,
              boxShadow: "0 4px 16px rgba(160,90,44,0.08)",
            }}
            bodyStyle={{ padding: 24 }}
            extra={
              <Select
                value={selectedYear}
                onChange={(year) => setSelectedYear(year)}
                style={{ minWidth: 120 }}
              >
                {yearList.map((y) => (
                  <Select.Option key={y} value={y}>{`Năm ${y}`}</Select.Option>
                ))}
              </Select>
            }
          >
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={monthlyRevenueData[selectedYear]}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                <YAxis tickFormatter={(v) => `${v / 1000000}tr`} />
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString()} đ`}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#D97B41"
                  name="Doanh thu"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Cột bên phải */}
        <Col xs={24} lg={7}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Card
                title={
                  <span style={{ color: "#A05A2C", fontWeight: 600 }}>
                    Tỉ lệ hình thức mua hàng
                  </span>
                }
                bordered={false}
                style={{ borderRadius: 12 }}
              >
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={customerTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={renderCustomerTypeLabel}
                      labelLine={true}
                      stroke="#fff"
                    >
                      {customerTypeData.map((_entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={customerTypeColors[idx]} />
                      ))}
                    </Pie>
                    <Tooltip content={CustomCustomerTypeTooltip} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={24}>
              <Card
                title={
                  <span style={{ color: "#A05A2C", fontWeight: 600 }}>
                    Top 6 sản phẩm bán chạy
                  </span>
                }
                bordered={false}
                style={{ borderRadius: 12 }}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={topProducts}
                  renderItem={(item, _idx) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{ background: "#D97B41" }}
                            icon={<TrophyOutlined />}
                          />
                        }
                        title={
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                        }
                        description={
                          <span>
                            Bán: <b>{item.sold}</b> | Doanh thu:{" "}
                            <b>{item.revenue.toLocaleString()}đ</b>
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Đơn hàng mới nhất */}
      <Row style={{ marginTop: 32 }}>
        <Col xs={24}>
          <Card
            title={
              <span style={{ color: "#A05A2C", fontWeight: 600 }}>
                Đơn hàng mới nhất
              </span>
            }
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Table
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: "Mã", dataIndex: "id", key: "id", width: 70 },
                {
                  title: "Khách hàng",
                  dataIndex: "customer",
                  key: "customer",
                  width: 120,
                },
                {
                  title: "Sản phẩm",
                  dataIndex: "product",
                  key: "product",
                  width: 120,
                },
                {
                  title: "Số tiền",
                  dataIndex: "amount",
                  key: "amount",
                  width: 90,
                  render: (v: number) => v.toLocaleString() + "đ",
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  width: 90,
                  render: (v: string) => (
                    <Tag color={orderStatusColors[v]}>{v}</Tag>
                  ),
                },
              ]}
              scroll={{ x: 400 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;
