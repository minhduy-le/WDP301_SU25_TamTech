import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Table,
  Space,
  Button,
  Progress,
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/plots';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const generateChartData = () => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  return dates.map(date => ({
    date,
    revenue: Math.floor(Math.random() * 10000000),
    orders: Math.floor(Math.random() * 100),
    users: Math.floor(Math.random() * 50),
  }));
};

const generateTopProducts = () => {
  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `Sản phẩm ${i + 1}`,
    sales: Math.floor(Math.random() * 1000),
    revenue: Math.floor(Math.random() * 10000000),
    growth: Math.random() * 100 - 50,
  }));
};

const generateStorePerformance = () => {
  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `Cửa hàng ${i + 1}`,
    revenue: Math.floor(Math.random() * 100000000),
    orders: Math.floor(Math.random() * 1000),
    completion: Math.floor(Math.random() * 100),
  }));
};

const ReportManagement: React.FC = () => {
  const [timeRange, setTimeRange] = useState<[string, string]>(['', '']);
  const [reportType, setReportType] = useState('daily');

  const chartData = generateChartData();
  const topProducts = generateTopProducts();
  const storePerformance = generateStorePerformance();

  const filteredChartData = chartData.filter(item => {
    if (!timeRange[0] || !timeRange[1]) return true;
    const itemDate = new Date(item.date);
    const startDate = new Date(timeRange[0]);
    const endDate = new Date(timeRange[1]);
    return itemDate >= startDate && itemDate <= endDate;
  });

  const totalStats = {
    revenue: filteredChartData.reduce((sum, item) => sum + item.revenue, 0),
    orders: filteredChartData.reduce((sum, item) => sum + item.orders, 0),
    users: filteredChartData.reduce((sum, item) => sum + item.users, 0),
    growth: 15.3,
  };

  const lineConfig = {
    data: filteredChartData,
    xField: 'date',
    yField: 'revenue',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: ['#2E7D32'],
  };

  // Bar chart config with filtered data
  const barConfig = {
    data: filteredChartData,
    xField: 'date',
    yField: 'orders',
    color: '#4CAF50',
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000,
      },
    },
  };

  // Pie chart config
  const pieConfig = {
    data: storePerformance.map(store => ({
      type: store.name,
      value: store.revenue,
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
    },
    color: ['#2E7D32', '#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9'],
  };

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Doanh số',
      dataIndex: 'sales',
      key: 'sales',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `${(value / 1000000).toFixed(1)}M`,
    },
    {
      title: 'Tăng trưởng',
      dataIndex: 'growth',
      key: 'growth',
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#2E7D32' : '#d32f2f' }}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(value).toFixed(1)}%
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalStats.revenue}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="đ"
              valueStyle={{ color: '#2E7D32' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={totalStats.orders}
              prefix={<ShoppingOutlined/>}
              valueStyle={{ color: '#2E7D32', display: 'flex', justifyContent: 'left' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Người dùng mới"
              value={totalStats.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#2E7D32' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tăng trưởng"
              value={totalStats.growth}
              precision={1}
              valueStyle={{ color: '#2E7D32' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card
            title="Báo cáo doanh thu"
            extra={
              <Space>
                <RangePicker
                  onChange={(dates) => {
                    if (dates) {
                      setTimeRange([
                        dates[0]?.toISOString() || '',
                        dates[1]?.toISOString() || '',
                      ]);
                    } else {
                      setTimeRange(['', '']); // Reset when cleared
                    }
                  }}
                  value={timeRange[0] && timeRange[1] ? [moment(timeRange[0]), moment(timeRange[1])] : null}
                />
                <Select
                  value={reportType}
                  style={{ width: 120 }}
                  onChange={setReportType}
                >
                  <Option value="daily">Hàng ngày</Option>
                  <Option value="weekly">Hàng tuần</Option>
                  <Option value="monthly">Hàng tháng</Option>
                </Select>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  style={{
                    background: '#2E7D32',
                    borderColor: '#2E7D32',
                  }}
                  onClick={() => {
                    // Export data based on current filters
                    const exportData = {
                      timeRange,
                      reportType,
                      data: filteredChartData,
                      totals: totalStats
                    };
                    console.log('Exporting data:', exportData);
                    // Add your export logic here
                  }}
                >
                  Xuất báo cáo
                </Button>
              </Space>
            }
          >
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Đơn hàng theo thời gian">
            <Bar {...barConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Phân bố doanh thu theo cửa hàng">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Top sản phẩm bán chạy">
            <Table
              columns={columns}
              dataSource={topProducts}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Hiệu suất cửa hàng">
            {storePerformance.map(store => (
              <div key={store.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>{store.name}</span>
                  <span>{store.revenue.toLocaleString()}đ</span>
                </div>
                <Progress
                  percent={store.completion}
                  strokeColor={{
                    '0%': '#C8E6C9',
                    '100%': '#2E7D32',
                  }}
                  showInfo={false}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportManagement; 