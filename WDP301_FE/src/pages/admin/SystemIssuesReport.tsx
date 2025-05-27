import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Button,
  Progress,
  Timeline,
  Statistic,
} from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  BugOutlined,
  ApiOutlined,
  CloudServerOutlined,
  DownloadOutlined,
  UserOutlined,
} from '@ant-design/icons';

const generateSystemIssues = () => {
  const statuses = ['critical', 'warning', 'info', 'resolved'];
  const components = ['API Gateway', 'Database', 'Authentication', 'File Storage', 'Cache Server'];
  const types = ['Error', 'Warning', 'Info', 'Maintenance'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    component: components[Math.floor(Math.random() * components.length)],
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    description: `Issue description ${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    impact: Math.floor(Math.random() * 100),
  }));
};

// Generate fake data for system metrics
const generateSystemMetrics = () => {
  return {
    uptime: 99.9,
    responseTime: 150,
    errorRate: 0.5,
    activeUsers: 1250,
    cpuUsage: 45,
    memoryUsage: 60,
    diskUsage: 75,
    networkUsage: 30,
  };
};

const SystemIssuesReport: React.FC = () => {
  const [issues] = useState(generateSystemIssues());
  const [metrics] = useState(generateSystemMetrics());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'orange';
      case 'info':
        return 'blue';
      case 'resolved':
        return 'green';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Error':
        return <BugOutlined style={{ color: '#ff4d4f' }} />;
      case 'Warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'Info':
        return <ExclamationCircleOutlined style={{ color: '#1890ff' }} />;
      case 'Maintenance':
        return <SyncOutlined style={{ color: '#52c41a' }} />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: 'Component',
      dataIndex: 'component',
      key: 'component',
      render: (text: string) => (
        <Space>
          <CloudServerOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Space>
          {getTypeIcon(type)}
          {type}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      render: (impact: number) => (
        <Progress
          percent={impact}
          size="small"
          status={impact > 70 ? 'exception' : impact > 30 ? 'normal' : 'success'}
          showInfo={false}
        />
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="System Uptime"
              value={metrics.uptime}
              precision={1}
              suffix="%"
              valueStyle={{ color: metrics.uptime > 99 ? '#52c41a' : '#faad14' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Response Time"
              value={metrics.responseTime}
              suffix="ms"
              valueStyle={{ color: metrics.responseTime < 200 ? '#52c41a' : '#faad14' }}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Error Rate"
              value={metrics.errorRate}
              precision={2}
              suffix="%"
              valueStyle={{ color: metrics.errorRate < 1 ? '#52c41a' : '#ff4d4f' }}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={metrics.activeUsers}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="System Resources">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: '8px' }}>CPU Usage</div>
                <Progress
                  percent={metrics.cpuUsage}
                  status={metrics.cpuUsage > 80 ? 'exception' : 'normal'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
              <div>
                <div style={{ marginBottom: '8px' }}>Memory Usage</div>
                <Progress
                  percent={metrics.memoryUsage}
                  status={metrics.memoryUsage > 80 ? 'exception' : 'normal'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
              <div>
                <div style={{ marginBottom: '8px' }}>Disk Usage</div>
                <Progress
                  percent={metrics.diskUsage}
                  status={metrics.diskUsage > 80 ? 'exception' : 'normal'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
              <div>
                <div style={{ marginBottom: '8px' }}>Network Usage</div>
                <Progress
                  percent={metrics.networkUsage}
                  status={metrics.networkUsage > 80 ? 'exception' : 'normal'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Recent System Events">
            <Timeline>
              {issues.slice(0, 5).map((issue) => (
                <Timeline.Item
                  key={issue.id}
                  color={getStatusColor(issue.status)}
                  dot={getTypeIcon(issue.type)}
                >
                  <p>{issue.description}</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(issue.timestamp).toLocaleString()}
                  </p>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Card
            title="System Issues"
            extra={
              <Space>
                <Button type="primary" icon={<SyncOutlined />}>
                  Refresh
                </Button>
                <Button icon={<DownloadOutlined />}>Export</Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={issues}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemIssuesReport; 