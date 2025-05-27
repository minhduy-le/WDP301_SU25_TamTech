import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table'; 
import type { SorterResult, FilterValue } from 'antd/es/table/interface'; 

const { Option } = Select;

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string;
}

const generateFakeUsers = (): User[] => {
  const roles: ('admin' | 'manager' | 'user')[] = ['admin', 'manager', 'user'];
  const statuses: ('active' | 'inactive')[] = ['active', 'inactive'];

  return Array.from({ length: 20 }, (_, index) => ({
    id: `USER${String(index + 1).padStart(3, '0')}`,
    username: `user${index + 1}`,
    email: `user${index + 1}@example.com`,
    fullName: `User ${index + 1}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  }));
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(generateFakeUsers());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<User>>({});


  const handleChange: TableProps<User>['onChange'] = (pagination, filters, sorter, extra) => {
    console.log('Various parameters', pagination, filters, sorter, extra);
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<User>); 
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      sorter: (a, b) => a.id.localeCompare(b.id),
      sortOrder: sortedInfo.columnKey === 'id' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortOrder: sortedInfo.columnKey === 'email' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      sortOrder: sortedInfo.columnKey === 'fullName' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: User['role']) => {
        const color = role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'green';
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'User', value: 'user' },
      ],
      filteredValue: filteredInfo.role || null,
      onFilter: (value, record) => record.role === (value as User['role']),
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: User['status']) => {
        const color = status === 'active' ? 'green' : 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === (value as User['status']),
      ellipsis: true,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{
              background: '#2E7D32',
              borderColor: '#2E7D32',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)',
              outline: 'none',
            }}
          />
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${record.status === 'active' ? 'khóa' : 'mở khóa'} người dùng này?`}
            onConfirm={() => handleBlock(record)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{
              style: {
                background: record.status === 'active' ? '#d32f2f' : '#2E7D32',
                borderColor: record.status === 'active' ? '#d32f2f' : '#2E7D32',
                borderRadius: '6px',
                outline: 'none',
              }
            }}
          >
            <Button
              type={record.status === 'active' ? 'primary' : 'default'}
              danger={record.status === 'active'}
              icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
              style={{
                borderRadius: '6px',
                outline: 'none',
                ...(record.status === 'active'
                  ? {
                    background: '#d32f2f',
                    borderColor: '#d32f2f',
                    boxShadow: '0 2px 4px rgba(211, 47, 47, 0.2)',
                  }
                  : {
                    borderColor: '#4CAF50',
                    color: '#2E7D32',
                  }
                ),
              }}
            >
              {record.status === 'active' ? 'Khóa' : 'Mở khóa'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      role: 'user',
    });
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleBlock = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    message.success(`Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} người dùng thành công`);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingUser) {
        setUsers(users.map(user =>
          user.id === editingUser.id ? { ...user, ...values, username: user.username } : user 
        ));
        message.success('Cập nhật người dùng thành công');
      } else {
        const newUser: User = {
          id: `USER${String(users.length + 1).padStart(3, '0')}`,
          username: values.email.split('@')[0] || `user${users.length + 1}`, 
          ...values,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(), 
        };
        setUsers([...users, newUser]);
        message.success('Thêm người dùng thành công');
      }
      setIsModalVisible(false);
    });
  };

  const displayedUsers = users.filter(user => {
    const matchSearchText = Object.values(user).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    );
    if (!matchSearchText && searchText) return false; 

    return true; 
  });


  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.status === 'active').length,
    managers: users.filter(user => user.role === 'manager').length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Người dùng đang hoạt động"
              value={stats.activeUsers}
              prefix={<CheckCircleOutlined style={{color: 'green'}} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Số lượng manager"
              value={stats.managers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Input
            placeholder="Tìm kiếm chung..."
            prefix={<SearchOutlined style={{ color: '#2E7D32' }} />}
            style={{
              width: '300px',
              borderRadius: '20px',
              borderColor: '#4CAF50',
            }}
            onChange={e => setSearchText(e.target.value)}
            value={searchText}
            allowClear
          />
          <Space wrap>
           
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleAdd}
              style={{
                background: '#2E7D32',
                borderColor: '#2E7D32',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)',
                outline: 'none',
              }}
            >
              Thêm người dùng
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={displayedUsers} 
          rowKey="id"
          scroll={{ x: 1300 }}
          pagination={{
            current: sortedInfo.order || filteredInfo ? 1 : undefined, 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          onChange={handleChange}
        />
      </Card>

      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingUser ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            background: '#2E7D32',
            borderColor: '#2E7D32',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)',
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '6px',
            borderColor: '#4CAF50',
            color: '#2E7D32',
            outline: 'none',
          }
        }}
        bodyStyle={{
          padding: '24px',
          background: '#F5F5F5',
        }}
        style={{
          top: 20,
        }}
        destroyOnClose 
      >
        <Form
          form={form}
          layout="vertical"
          style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input
              placeholder="Nhập email"
              style={{ borderRadius: '4px' }}
              disabled={!!editingUser} 
            />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input
              placeholder="Nhập họ và tên"
              style={{ borderRadius: '4px' }}
            />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              placeholder="Chọn vai trò"
              style={{ borderRadius: '4px' }}
            >
              <Option value="admin">
                <Tag color="red">ADMIN</Tag>
              </Option>
              <Option value="manager">
                <Tag color="blue">MANAGER</Tag>
              </Option>
              <Option value="user">
                <Tag color="green">USER</Tag>
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select
              placeholder="Chọn trạng thái"
              style={{ borderRadius: '4px'}}
            >
              <Option value="active">
                <Tag color="green">ACTIVE</Tag>
              </Option>
              <Option value="inactive">
                <Tag color="red">INACTIVE</Tag>
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;