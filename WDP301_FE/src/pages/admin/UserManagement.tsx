import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { SorterResult, FilterValue } from "antd/es/table/interface";
import spinTamTac from "../../assets/spinTamTac.json";
import Lottie from "lottie-react";

const { Option } = Select;

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "user";
  status: "active" | "inactive";
  date_of_birth: string;
  phone_number?: string;
  _apiIsActive?: boolean;
  _apiIsBan?: boolean;
}

interface ApiAccount {
  id: number;
  fullName: string;
  email: string;
  phone_number: string;
  isActive: boolean;
  date_of_birth: string | null;
  note: string | null;
  isBan: boolean;
  member_point: number;
  member_rank: number;
  role: string;
}
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<User>>({});

  const mapApiAccountToUser = (apiUser: ApiAccount): User => {
    let appRole: "admin" | "manager" | "user" = "user";
    const apiRoleLower = apiUser.role?.toLowerCase();

    if (apiRoleLower === "admin") {
      appRole = "admin";
    } else if (apiRoleLower === "manager") {
      appRole = "manager";
    } else if (apiRoleLower === "user") {
      appRole = "user";
    } else {
      console.warn(
        `Unmapped API role: "${apiUser.role}". Defaulting to 'user'.`
      );
    }

    return {
      id: String(apiUser.id),
      username: apiUser.email.split("@")[0] || `user${apiUser.id}`,
      email: apiUser.email,
      fullName: apiUser.fullName,
      role: appRole,
      status: apiUser.isActive && !apiUser.isBan ? "active" : "inactive",
      date_of_birth: apiUser.date_of_birth || "",
      phone_number: apiUser.phone_number,
      _apiIsActive: apiUser.isActive,
      _apiIsBan: apiUser.isBan,
    };
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://wdp-301-0fd32c261026.herokuapp.com/api/accounts",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData: unknown = await response.json();

        let accountsToMap: ApiAccount[];

        if (Array.isArray(apiData)) {
          accountsToMap = apiData as ApiAccount[];
        } else if (
          apiData &&
          typeof apiData === "object" &&
          "accounts" in apiData &&
          Array.isArray((apiData as any).accounts)
        ) {
          accountsToMap = (apiData as { accounts: ApiAccount[] }).accounts;
        } else if (
          apiData &&
          typeof apiData === "object" &&
          "data" in apiData &&
          Array.isArray((apiData as any).data)
        ) {
          accountsToMap = (apiData as { data: ApiAccount[] }).data;
        } else {
          console.error("Unexpected API response structure:", apiData);
          message.error(
            "Dữ liệu người dùng trả về có cấu trúc không mong đợi."
          );
          accountsToMap = [];
        }

        const mappedUsers = accountsToMap.map(mapApiAccountToUser);
        setUsers(mappedUsers);
        if (mappedUsers.length > 0) {
          message.success("Tải danh sách người dùng thành công!");
        } else if (accountsToMap.length === 0 && Array.isArray(apiData)) {
          message.info("Không có người dùng nào trong danh sách.");
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        message.error(
          `Không thể tải danh sách người dùng: ${
            error instanceof Error ? error.message : "Lỗi không xác định"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange: TableProps<User>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("Various parameters", pagination, filters, sorter, extra);
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<User>);
  };

  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      align: "center",
      sorter: (a, b) => a.id.localeCompare(b.id),
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      align: "center",
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortOrder: sortedInfo.columnKey === "email" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      align: "center",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      sortOrder: sortedInfo.columnKey === "fullName" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      align: "center",
      render: (role: User["role"]) => {
        const color =
          role === "admin" ? "red" : role === "manager" ? "blue" : "green";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Manager", value: "manager" },
        { text: "User", value: "user" },
      ],
      filteredValue: filteredInfo.role || null,
      onFilter: (value, record) => record.role === (value as User["role"]),
      ellipsis: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      width: 180,
      align: "center",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: User["status"]) => {
        const color = status === "active" ? "green" : "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === (value as User["status"]),
      ellipsis: true,
    },
    {
      title: "Ngày sinh",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      width: 180,
      align: "center",
      render: (dateStr: string) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) ? date.toLocaleDateString() : "N/A";
      },
      sorter: (a, b) => {
        const dateA = a.date_of_birth ? new Date(a.date_of_birth).getTime() : 0;
        const dateB = b.date_of_birth ? new Date(b.date_of_birth).getTime() : 0;
        return dateA - dateB;
      },
      sortOrder:
        sortedInfo.columnKey === "date_of_birth" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 190,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{
              background: "#2E7D32",
              borderColor: "#2E7D32",
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgba(46, 125, 50, 0.2)",
              outline: "none",
            }}
          />
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${
              record.status === "active" ? "khóa" : "mở khóa"
            } người dùng này?`}
            onConfirm={() => handleBlock(record)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{
              style: {
                background: record.status === "active" ? "#d32f2f" : "#2E7D32",
                borderColor: record.status === "active" ? "#d32f2f" : "#2E7D32",
                borderRadius: "6px",
                outline: "none",
              },
            }}
            cancelButtonProps={{
              style: { borderRadius: "6px", outline: "none" },
            }}
          >
            <Button
              type={record.status === "active" ? "primary" : "default"}
              danger={record.status === "active"}
              icon={
                record.status === "active" ? (
                  <StopOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              style={{
                borderRadius: "6px",
                ...(record.status === "active"
                  ? {
                      background: "#d32f2f",
                      borderColor: "#d32f2f",
                      boxShadow: "0 2px 4px rgba(211, 47, 47, 0.2)",
                      outline: "none",
                    }
                  : {
                      borderColor: "#4CAF50",
                      color: "#2E7D32",
                      outline: "none",
                    }),
              }}
            >
              {record.status === "active" ? "Khóa" : "Mở khóa"}
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
      status: "active",
      role: "user",
    });
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
    });
    setIsModalVisible(true);
  };

  const handleBlock = (userToToggle: User) => {
    const newStatus = userToToggle.status === "active" ? "inactive" : "active";
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userToToggle.id ? { ...u, status: newStatus } : u
      )
    );
    message.success(
      `Đã ${newStatus === "active" ? "mở khóa" : "khóa"} người dùng ${
        userToToggle.fullName
      } thành công`
    );
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingUser) {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === editingUser.id
                ? { ...editingUser, ...values, username: editingUser.username }
                : user
            )
          );
          message.success("Cập nhật người dùng thành công");
        } else {
          const newId = `NEW_USER_${Date.now()}`;
          const newUser: User = {
            id: newId,
            username: values.email.split("@")[0] || `user${users.length + 1}`,
            email: values.email,
            fullName: values.fullName,
            role: values.role,
            status: values.status,
            date_of_birth: new Date().toISOString(),
          };
          setUsers((prevUsers) => [...prevUsers, newUser]);
          message.success("Thêm người dùng thành công");
        }
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
        message.error("Vui lòng kiểm tra lại thông tin đã nhập.");
      });
  };

  const displayedUsers = users.filter((user) => {
    const searchTextLower = searchText.toLowerCase();
    const matchSearchText = Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchTextLower)
    );
    return matchSearchText;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.status === "active").length,
    managers: users.filter((user) => user.role === "manager").length,
  };

  return (
    <div style={{ padding: "24px", position: "relative", minHeight: 600 }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lottie
            animationData={spinTamTac}
            loop={true}
            style={{ width: 200, height: 200 }}
          />
        </div>
      )}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Tổng số người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Người dùng đang hoạt động"
              value={stats.activeUsers}
              prefix={<CheckCircleOutlined style={{ color: "green" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Số lượng manager"
              value={stats.managers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <Input
            placeholder="Tìm kiếm ID, Email, Tên,..."
            prefix={<SearchOutlined style={{ color: "#2E7D32" }} />}
            style={{
              width: "300px",
              borderRadius: "20px",
              borderColor: "#4CAF50",
            }}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            allowClear
          />
          <Space wrap>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleAdd}
              style={{
                background: "#2E7D32",
                borderColor: "#2E7D32",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(46, 125, 50, 0.2)",
                outline: "none",
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
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          onChange={handleChange}
          locale={{
            emptyText: loading ? "Đang tải dữ liệu..." : "Không có dữ liệu",
          }}
        />
      </Card>

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText={editingUser ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            background: "#2E7D32",
            borderColor: "#2E7D32",
            borderRadius: "6px",
            outline: "none",
          },
        }}
        cancelButtonProps={{
          style: {
            borderRadius: "6px",
            borderColor: "#4CAF50",
            color: "#2E7D32",
            outline: "none",
          },
        }}
        bodyStyle={{ padding: "24px", background: "#F5F5F5" }}
        style={{ top: 20 }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          initialValues={{ status: "active", role: "user" }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input
              placeholder="Nhập email"
              style={{ borderRadius: "4px" }}
              disabled={!!editingUser}
            />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input
              placeholder="Nhập họ và tên"
              style={{ borderRadius: "4px" }}
            />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select placeholder="Chọn vai trò">
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
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">
                <Tag color="green">ACTIVE</Tag>
              </Option>
              <Option value="inactive">
                <Tag color="red">INACTIVE</Tag>
              </Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone_number" label="Số điện thoại">
            <Input
              placeholder="Nhập số điện thoại"
              style={{ borderRadius: "4px" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
