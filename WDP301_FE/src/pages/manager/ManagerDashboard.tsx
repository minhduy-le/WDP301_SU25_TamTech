import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  List,
  Avatar,
  Select,
  Button,
  Progress,
  message,
  DatePicker,
} from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  TrophyOutlined,
  DownloadOutlined,
  DashboardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
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
  AreaChart,
  Area,
} from "recharts";
import type { TooltipProps } from "recharts";
import LatestOrders from "../../components/manager/dashboard/LatestOrders";
import {
  useRevenueStats,
  useTopProducts,
  useCurrentMonthRevenue,
  useCurrentMonthProduct,
  useCurrentMonthOrder,
  useWeeklyRevenue,
  useProductTypeSales,
  useStaffProductivity,
} from "../../hooks/dashboardApi";
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;

const currentYear = new Date().getFullYear();
const startYear = 2025;

const yearList: number[] = [];
for (let y = startYear; y <= currentYear; y++) {
  yearList.push(y);
}
export interface ProductTypeSaleStat {
  productType: string;
  totalQuantity: number;
}

const customerTypeColors = ["#B22222", "#FF6F3C", "#FFC107", "	#347433"];

const renderCustomerTypeLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  value,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  value: number;
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#A05A2C"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={15}
      fontWeight={600}
    >
      {value}
    </text>
  );
};

const CustomCustomerTypeTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 10,
          color: "#A05A2C",
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        {name}: {value} lượt
      </div>
    );
  }
  return null;
};

const ManagerDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // Hàm format ngày thành MM-dd-YYYY
  const formatDate = (date: any) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
  };
  
  // Tính toán ngày mặc định: từ hiện tại đến 7 ngày trước
  const getDefaultDateRange = () => {
    const endDate = dayjs();
    const startDate = dayjs().subtract(7, 'day');
    return {
      startDate: formatDate(startDate.toDate()),
      endDate: formatDate(endDate.toDate()),
      startDateObj: startDate,
      endDateObj: endDate
    };
  };

  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultRange.startDate);
  const [endDate, setEndDate] = useState<string>(defaultRange.endDate);
  
  const { data: staffProductivity = [] } = useStaffProductivity();

  const { data: revenueStats } = useRevenueStats(selectedYear);
  const { data: topProductsData = [], isLoading: topProductsLoading } =
    useTopProducts(startDate, endDate);
  const monthlyRevenueData =
    revenueStats?.map((s) => ({
      month: `Tháng ${s.month}`,
      revenue: s.revenue,
    })) || [];

  const topProducts = topProductsData.map((p) => ({
    name: p.productName,
    sold: p.totalQuantity,
    revenue: p.totalRevenue,
  }));
  const { data: currentMonthProductStats } = useCurrentMonthProduct();
  const { data: currentMonthRevenueStats } = useCurrentMonthRevenue();
  const { data: currentMonthOrderStats } = useCurrentMonthOrder();
  const { data: weeklyRevenue = [] } = useWeeklyRevenue();
  const { data: productTypeStats = [] } = useProductTypeSales();
  const productTypeData = productTypeStats.map((item: ProductTypeSaleStat) => ({
    name: item.productType,
    value: item.totalQuantity,
  }));
  const weeklyChartData = weeklyRevenue.map((w: any) => ({
    week: `Tuần ${w.week}`,
    "Doanh thu tháng trước": w.previousMonthRevenue,
    "Doanh thu tháng này": w.currentMonthRevenue,
  }));

  // Hàm xử lý khi chọn ngày
  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setStartDate(formatDate(dates[0]));
      setEndDate(formatDate(dates[1]));
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleExportReport = () => {
    try {
      // Tạo workbook mới
      const workbook = XLSX.utils.book_new();
      
      // Sheet 1: Tổng quan
      const overviewData = [
        {
          "Chỉ số": "Doanh thu tháng này",
          "Giá trị": `${(currentMonthRevenueStats?.currentRevenue || 0).toLocaleString()} đ`,
          "Thay đổi (%)": `${currentMonthRevenueStats?.percentageChange || 0}%`
        },
        {
          "Chỉ số": "Đơn hàng tháng này", 
          "Giá trị": currentMonthOrderStats?.currentOrders || 0,
          "Thay đổi (%)": `${currentMonthOrderStats?.percentageChange || 0}%`
        },
        {
          "Chỉ số": "Giá trị đơn trung bình",
          "Giá trị": `${(currentMonthRevenueStats?.averageOrderValue || 0).toLocaleString()} đ`,
          "Thay đổi (%)": "-"
        },
        {
          "Chỉ số": "Sản phẩm bán ra",
          "Giá trị": currentMonthProductStats?.currentQuantity || 0,
          "Thay đổi (%)": `${currentMonthProductStats?.percentageChange || 0}%`
        }
      ];
      
      const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(workbook, overviewSheet, "Tổng quan");
      
      // Sheet 2: Doanh thu theo tháng
      const revenueData = monthlyRevenueData.map(item => ({
        "Tháng": item.month,
        "Doanh thu (VNĐ)": `${item.revenue.toLocaleString()} đ`
      }));
      
      const revenueSheet = XLSX.utils.json_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(workbook, revenueSheet, "Doanh thu theo tháng");
      
      // Sheet 3: Sản phẩm bán chạy
      const productData = topProducts.map((product, index) => ({
        "Thứ hạng": index + 1,
        "Tên sản phẩm": product.name,
        "Số lượng bán": product.sold,
        "Doanh thu (VNĐ)": `${product.revenue.toLocaleString()} đ`
      }));
      
      // Thêm thông tin khoảng thời gian nếu có
      if (startDate && endDate) {
        productData.unshift({
          "Thứ hạng": 0,
          "Tên sản phẩm": `Khoảng thời gian: ${startDate} - ${endDate}`,
          "Số lượng bán": 0,
          "Doanh thu (VNĐ)": "0 đ"
        });
      }
      
      const productSheet = XLSX.utils.json_to_sheet(productData);
      XLSX.utils.book_append_sheet(workbook, productSheet, "Sản phẩm bán chạy");
      
      // Sheet 4: Hiệu suất nhân viên
      const staffData = staffProductivity.map((staff, index) => ({
        "Thứ hạng": index + 1,
        "Tên nhân viên": staff.fullName,
        "Doanh thu (VNĐ)": `${staff.totalRevenue.toLocaleString()} đ`
      }));
      
      const staffSheet = XLSX.utils.json_to_sheet(staffData);
      XLSX.utils.book_append_sheet(workbook, staffSheet, "Hiệu suất nhân viên");
      
      // Sheet 5: Loại sản phẩm bán chạy
      const productTypeData = productTypeStats.map((item, index) => ({
        "Thứ hạng": index + 1,
        "Loại sản phẩm": item.productType,
        "Số lượng bán": item.totalQuantity
      }));
      
      const productTypeSheet = XLSX.utils.json_to_sheet(productTypeData);
      XLSX.utils.book_append_sheet(workbook, productTypeSheet, "Loại sản phẩm");
      
      // Xuất file
      const fileName = `Bao_cao_Dashboard_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      message.success("Xuất báo cáo thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất báo cáo:", error);
      message.error("Có lỗi xảy ra khi xuất báo cáo!");
    }
  };

  return (
    <div
      style={{
        paddingTop: 15,
        padding: 32,
        background: "#FFF9F0",
        minHeight: "100vh",
      }}
    >
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
          Dashboard <DashboardOutlined />
        </Title>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          style={{ background: "#D97B41", borderColor: "#D97B41" }}
          onClick={handleExportReport}
        >
          Xuất báo cáo
        </Button>
      </div>

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
        /* Màu border và shadow khi focus vào DatePicker */
        .ant-picker-focused,
        .ant-picker:focus,
        .ant-picker:hover {
          border-color: #D97B41 !important;
          box-shadow: 0 0 0 2px #F9E4B7 !important;
        }
        /* Màu icon trong DatePicker */
        .ant-picker-suffix {
          color: #D97B41 !important;
        }
        /* Màu ngày được chọn trong calendar */
        .ant-picker-cell-selected .ant-picker-cell-inner {
          background-color: #D97B41 !important;
        }
        /* Màu ngày hover trong calendar */
        .ant-picker-cell:hover .ant-picker-cell-inner {
          background-color: #F9E4B7 !important;
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
              value={currentMonthRevenueStats?.currentRevenue || 0}
              precision={0}
              valueStyle={{ color: "#D97B41", fontWeight: 700 }}
              prefix={<DollarOutlined />}
              formatter={(value) => `${Number(value).toLocaleString()} đ`}
            />

            {typeof currentMonthRevenueStats?.percentageChange === "number" ? (
              <Text
                type={
                  currentMonthRevenueStats.percentageChange >= 0
                    ? "success"
                    : "warning"
                }
              >
                {currentMonthRevenueStats.percentageChange >= 0 ? "+" : ""}
                {currentMonthRevenueStats.percentageChange}% so với tháng trước
              </Text>
            ) : (
              <Text type="secondary">Đang tải...</Text>
            )}
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
              value={currentMonthOrderStats?.currentOrders || 0}
              valueStyle={{ color: "#A05A2C", fontWeight: 700 }}
              prefix={<ShoppingOutlined />}
              precision={0}
              groupSeparator=","
            />
            {typeof currentMonthOrderStats?.percentageChange === "number" ? (
              <Text
                type={
                  currentMonthOrderStats.percentageChange >= 0
                    ? "success"
                    : "warning"
                }
              >
                {currentMonthOrderStats.percentageChange >= 0 ? "+" : ""}
                {currentMonthOrderStats.percentageChange}% so với tháng trước
              </Text>
            ) : (
              <Text type="secondary">Đang tải...</Text>
            )}
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
              value={currentMonthRevenueStats?.averageOrderValue || 0}
              valueStyle={{ color: "#D97B41", fontWeight: 700 }}
              prefix={<DollarOutlined />}
              suffix="đ"
              precision={0}
              groupSeparator=","
            />
            <Text type="secondary" style={{ color: "#A05A2C" }}>
              Mỗi đơn hàng trong tháng này
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
                  Sản phẩm bán ra
                </span>
              }
              value={currentMonthProductStats?.currentQuantity || 0}
              valueStyle={{ color: "#faad14", fontWeight: 700 }}
              prefix={<ShoppingOutlined />}
              precision={0}
              groupSeparator=","
            />
            {typeof currentMonthProductStats?.percentageChange === "number" ? (
              <Text
                type={
                  currentMonthProductStats.percentageChange >= 0
                    ? "success"
                    : "warning"
                }
              >
                {currentMonthProductStats.percentageChange >= 0 ? "+" : ""}
                {currentMonthProductStats.percentageChange}% so với tháng trước
              </Text>
            ) : (
              <Text type="secondary">Đang tải...</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24} lg={17}>
          <Card
            title={
              <span style={{ color: "#A05A2C", fontWeight: 700, fontSize: 20 }}>
                So sánh doanh thu tháng này và tháng trước
              </span>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 6px 24px rgba(160,90,44,0.10)",
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                width={730}
                height={250}
                data={weeklyChartData}
                margin={{ top: 24, left: 0, bottom: 8 }}
              >
                <defs>
                  <linearGradient
                    id="colorLastMonth"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#A05A2C" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#A05A2C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorThisMonth"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#faad14" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#faad14" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => v.toLocaleString()}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(v) => v.toLocaleString()} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Doanh thu tháng trước"
                  stroke="#A05A2C"
                  fillOpacity={1}
                  fill="url(#colorLastMonth)"
                />
                <Area
                  type="monotone"
                  dataKey="Doanh thu tháng này"
                  stroke="#faad14"
                  fillOpacity={1}
                  fill="url(#colorThisMonth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title={
              <span style={{ color: "#A05A2C", fontWeight: 700, fontSize: 20 }}>
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
                data={monthlyRevenueData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 13 }}
                  tickCount={12}
                  interval={0}
                />
                <YAxis tickFormatter={(v) => v.toLocaleString()} />
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
                    Tỉ lệ loại sản phẩm bán chạy
                  </span>
                }
                bordered={false}
                style={{ borderRadius: 12 }}
              >
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={productTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="42%"
                      outerRadius={90}
                      label={renderCustomerTypeLabel}
                      labelLine={true}
                      stroke="#fff"
                    >
                      {productTypeData.map((_entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={customerTypeColors[idx]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={CustomCustomerTypeTooltip} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      style={{ marginBottom: 10 }}
                    />
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
                 <div style={{ marginBottom: 16 }}>
                   <DatePicker.RangePicker
                     onChange={handleDateChange}
                     placeholder={["Từ ngày", "Đến ngày"]}
                     format="DD/MM/YYYY"
                     style={{ width: "100%" }}
                     allowClear={true}
                     defaultValue={[defaultRange.startDateObj, defaultRange.endDateObj]}
                   />
                 </div>
                {!startDate || !endDate ? (
                  <div style={{ 
                    textAlign: "center", 
                    padding: "40px 20px",
                    color: "#999"
                  }}>
                    <CalendarOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>Vui lòng chọn khoảng thời gian để xem sản phẩm bán chạy</div>
                  </div>
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={topProducts}
                    loading={topProductsLoading}
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
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row style={{ marginTop: 32 }}>
        <Col xs={24}>
          <LatestOrders />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <span style={{ color: "#A05A2C", fontWeight: 700, fontSize: 20 }}>
                Hiệu suất nhân viên
              </span>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 6px 24px rgba(160,90,44,0.10)",
            }}
          >
            {(() => {
              // Tính hiệu suất tương đối - nhân viên cao nhất = 100%
              const maxRevenue = Math.max(
                ...staffProductivity.map((s) => s.totalRevenue),
                1
              );

              return staffProductivity.map((staff, index) => (
                <div key={index} style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#A05A2C" }}>
                      {staff.fullName}
                    </span>
                    <span style={{ fontWeight: 600, color: "#D97B41" }}>
                      {staff.totalRevenue.toLocaleString()}đ
                    </span>
                  </div>
                  <Progress
                    percent={Math.min(
                      (staff.totalRevenue / maxRevenue) * 100,
                      100
                    )}
                    strokeColor={{
                      "0%": "#F9E4B7",
                      "100%": "#D97B41",
                    }}
                    showInfo={false}
                  />
                </div>
              ));
            })()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;
