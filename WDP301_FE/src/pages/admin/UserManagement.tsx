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
import axios, { AxiosError } from "axios"; 
import spinTamTac from "../../assets/spinTamTac.json";
import Lottie from "lottie-react";

const { Option } = Select;

const API_BASE_URL = "https://wdp-301-0fd32c261026.herokuapp.com/api";

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "user" | "staff" | "shipper"; 
  status: "active" | "inactive";
  date_of_birth: string;
  phone_number?: string;
  _apiIsActive?: boolean;
  _apiIsBan?: boolean;
  _apiNote?: string | null;
  _apiMemberPoint?: number;
  _apiMemberRank?: number;
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
  const [userList, setUserList] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredTableInfo, setFilteredTableInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedTableInfo, setSortedTableInfo] = useState<SorterResult<User>>(
    {}
  );

  const getAuthToken = (): string | null => localStorage.getItem("token");

  const mapApiAccountToUser = (apiAccount: ApiAccount): User => {
    let appUserRole: User["role"] = "user"; 
    const apiRoleLower = apiAccount.role?.toLowerCase();

    if (apiRoleLower === "admin") appUserRole = "admin";
    else if (apiRoleLower === "manager") appUserRole = "manager";
    else if (apiRoleLower === "staff") appUserRole = "staff";
    else if (apiRoleLower === "shipper") appUserRole = "shipper";
    else if (apiRoleLower === "user") appUserRole = "user";
    else {
      console.warn(
        `Unmapped API role: "${apiAccount.role}". Defaulting to 'user'.`
      );
    }

    return {
      id: String(apiAccount.id),
      username: apiAccount.email.split("@")[0] || `user${apiAccount.id}`,
      email: apiAccount.email,
      fullName: apiAccount.fullName,
      role: appUserRole,
      status: apiAccount.isActive && !apiAccount.isBan ? "active" : "inactive",
      date_of_birth: apiAccount.date_of_birth || "N/A", 
      phone_number: apiAccount.phone_number,
      _apiIsActive: apiAccount.isActive,
      _apiIsBan: apiAccount.isBan,
      _apiNote: apiAccount.note,
      _apiMemberPoint: apiAccount.member_point,
      _apiMemberRank: apiAccount.member_rank,
    };
  };

  const fetchUserList = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const apiResponse = await axios.get(`${API_BASE_URL}/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let accountsToMap: ApiAccount[];
      const responseData = apiResponse.data;

      if (Array.isArray(responseData)) {
        accountsToMap = responseData as ApiAccount[];
      } else if (responseData && Array.isArray(responseData.accounts)) {
        accountsToMap = responseData.accounts;
      } else if (responseData && Array.isArray(responseData.data)) {
        accountsToMap = responseData.data;
      } else {
        console.error("Unexpected API response structure:", responseData);
        message.error("Dữ liệu người dùng có cấu trúc không mong đợi.");
        accountsToMap = [];
      }

      const mappedUsers = accountsToMap.map(mapApiAccountToUser);
      setUserList(mappedUsers);

      if (mappedUsers.length > 0) {
      } else if (accountsToMap.length === 0 && Array.isArray(responseData)) {
        message.info("Không có người dùng nào trong danh sách.");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Failed to fetch users:", axiosError.response?.data || axiosError.message);
      message.error(
        `Không thể tải danh sách người dùng: ${(axiosError.response?.data as any)?.message || axiosError.message || "Lỗi không xác định"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const handleTableChange: TableProps<User>["onChange"] = (
    _pagination,
    filters,
    sorter
  ) => {
    setFilteredTableInfo(filters);
    setSortedTableInfo(sorter as SorterResult<User>);
  };

  const columns: ColumnsType<User> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, align: "center", sorter: (a, b) => parseInt(a.id) - parseInt(b.id), sortOrder: sortedTableInfo.columnKey === "id" ? sortedTableInfo.order : null, ellipsis: true },
    { title: "Email", dataIndex: "email", key: "email", width: 220, sorter: (a, b) => a.email.localeCompare(b.email), sortOrder: sortedTableInfo.columnKey === "email" ? sortedTableInfo.order : null, ellipsis: true },
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName", width: 200, sorter: (a, b) => a.fullName.localeCompare(b.fullName), sortOrder: sortedTableInfo.columnKey === "fullName" ? sortedTableInfo.order : null, ellipsis: true },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      align: "center",
      render: (role: User["role"]) => {
        let color = "default";
        let displayText = role.toUpperCase();
        switch (role) {
          case "admin": color = "red"; break;
          case "manager": color = "blue"; break;
          case "staff": color = "orange"; break;
          case "shipper": color = "cyan"; break;
          case "user": color = "green"; break;
        }
        return <Tag color={color}>{displayText}</Tag>;
      },
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Manager", value: "manager" },
        { text: "Staff", value: "staff" },
        { text: "Shipper", value: "shipper" },
        { text: "User", value: "user" },
      ],
      filteredValue: filteredTableInfo.role || null,
      onFilter: (value, record) => record.role === value,
      ellipsis: true,
    },
    { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number", width: 150, ellipsis: true, align: "center" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: User["status"]) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
      ],
      filteredValue: filteredTableInfo.status || null,
      onFilter: (value, record) => record.status === value,
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      align: "center",
      render: (_, userRecord) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(userRecord)}
            style={{ background: "#2E7D32", borderColor: "#2E7D32", borderRadius: "6px" }}
          />
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${userRecord.status === "active" ? "khóa" : "mở khóa"} tài khoản ${userRecord.fullName}?`}
            onConfirm={() => handleToggleUserBanStatus(userRecord)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ style: { background: userRecord.status === "active" ? "#d32f2f" : "#2E7D32", borderColor: userRecord.status === "active" ? "#d32f2f" : "#2E7D32", borderRadius: "6px" } }}
            cancelButtonProps={{ style: { borderRadius: "6px" } }}
          >
            <Button
              danger={userRecord.status === "active"}
              icon={userRecord.status === "active" ? <StopOutlined /> : <CheckCircleOutlined />}
              style={{ borderRadius: "6px", background: userRecord.status === "active" ? "" : "#2E7D32", color: userRecord.status === "active" ? "" : "white", borderColor: userRecord.status === "active" ? "" : "#2E7D32" }}
            >
              {userRecord.status === "active" ? "Khóa" : "Mở khóa"}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: "active", role: "user" }); 
    setIsModalVisible(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    form.setFieldsValue({
      email: userToEdit.email,
      fullName: userToEdit.fullName,
      role: userToEdit.role,
      status: userToEdit.status, 
      phone_number: userToEdit.phone_number,
    });
    setIsModalVisible(true);
  };

  const handleToggleUserBanStatus = async (userToToggle: User) => {
    const isCurrentlyActive = userToToggle.status === "active";  
    const newIsBan = isCurrentlyActive; 
    const newIsActive = !newIsBan; 

    const payloadForApi = {
      fullName: userToToggle.fullName,
      email: userToToggle.email,
      phone_number: userToToggle.phone_number || "", 
      date_of_birth: userToToggle.date_of_birth !== "N/A" ? userToToggle.date_of_birth : null,
      role: userToToggle.role, 
      note: userToToggle._apiNote || null,
      member_point: userToToggle._apiMemberPoint || 0,
      member_rank: userToToggle._apiMemberRank || 0,
      isActive: newIsActive,
      isBan: newIsBan,
    };

    try {
      setIsLoading(true);
      const token = getAuthToken();
      await axios.put(`${API_BASE_URL}/accounts/${userToToggle.id}`, payloadForApi, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success(
        `Đã ${newIsBan ? "khóa" : "mở khóa"} người dùng ${userToToggle.fullName} thành công.`
      );
      fetchUserList(); 
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Failed to toggle user ban status:", axiosError.response?.data || axiosError.message);
      message.error(
        `Lỗi khi ${newIsBan ? "khóa" : "mở khóa"} người dùng: ${(axiosError.response?.data as {message?: string})?.message || axiosError.message || "Lỗi không xác định"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSubmit = async () => {
    try {
      const formValues = await form.validateFields();
      setIsLoading(true);
      const token = getAuthToken();

      if (editingUser) {
        const payloadForApiUpdate: Partial<ApiAccount> = {
          fullName: formValues.fullName,
          phone_number: formValues.phone_number,
          role: formValues.role,
          isActive: formValues.status === "active",
          isBan: editingUser._apiIsBan,
          date_of_birth: editingUser.date_of_birth !== "N/A" ? editingUser.date_of_birth : null,
          note: editingUser._apiNote || null,
          member_point: editingUser._apiMemberPoint || 0,
          member_rank: editingUser._apiMemberRank || 0,
        };
        await axios.put(`${API_BASE_URL}/accounts/${editingUser.id}`, payloadForApiUpdate, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Cập nhật người dùng thành công!");
      } else {
        const payloadForApiCreate: Omit<ApiAccount, "id" | "member_point" | "member_rank" | "note" | "date_of_birth"> & { date_of_birth?: string | null, note?: string | null } = {
          email: formValues.email,
          fullName: formValues.fullName,
          phone_number: formValues.phone_number || "",
          role: formValues.role,
          isActive: formValues.status === "active",
          isBan: false, 
          date_of_birth: null, 
        };
        await axios.post(`${API_BASE_URL}/accounts`, payloadForApiCreate, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Thêm người dùng thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchUserList(); 
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.isAxiosError && axiosError.response?.status === 400 && axiosError.response?.data) {
        const apiErrors = axiosError.response.data as any;
        if (apiErrors.message) {
            message.error(`Lỗi: ${apiErrors.message}`);
        } else if (typeof apiErrors === 'object') {
            Object.entries(apiErrors).forEach(([field, messages]) => {
                if (Array.isArray(messages) && messages.length > 0) {
                    message.error(`${field}: ${messages.join(', ')}`);
                }
            });
        } else {
            message.error("Vui lòng kiểm tra lại thông tin đã nhập.");
        }
      } else {
        console.log("Validate Failed or API error:", error);
        message.error(`Thao tác thất bại: ${axiosError.message || "Lỗi không xác định"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayedUserList = userList.filter((user) => {
    const searchTextLower = searchText.toLowerCase();
    return Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchTextLower)
    );
  });

  const userStats = {
    totalUsers: userList.length,
    activeUsers: userList.filter((user) => user.status === "active").length,
    managers: userList.filter((user) => user.role === "manager").length,
    staffCount: userList.filter((user) => user.role === "staff").length,
    shipperCount: userList.filter((user) => user.role === "shipper").length,
  };

  return (
    <div style={{ padding: "24px", position: "relative", minHeight: "80vh" }}>
      {isLoading && (
        <div
          style={{
            position: "fixed", 
            top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(255,255,255,0.85)", zIndex: 10000,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Lottie animationData={spinTamTac} loop={true} style={{ width: 200, height: 200 }} />
        </div>
      )}
      <Row gutter={[16, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}><Card bordered={false}><Statistic title="Tổng số người dùng" value={userStats.totalUsers} prefix={<UserOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card bordered={false}><Statistic title="Đang hoạt động" value={userStats.activeUsers} prefix={<CheckCircleOutlined style={{ color: "green" }} />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card bordered={false}><Statistic title="Managers" value={userStats.managers} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card bordered={false}><Statistic title="Staff & Shippers" value={userStats.staffCount + userStats.shipperCount} prefix={<TeamOutlined />} /></Card></Col>
      </Row>

      <Card bordered={false}>
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <Input
            placeholder="Tìm kiếm ID, Email, Tên,..."
            prefix={<SearchOutlined style={{ color: "#2E7D32" }} />}
            style={{ width: "300px", borderRadius: "20px", borderColor: "#4CAF50" }}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            allowClear
          />
          <Button type="primary" icon={<UserAddOutlined />} onClick={handleAddUser} style={{ background: "#2E7D32", borderColor: "#2E7D32", borderRadius: "6px" }}>
            Thêm người dùng
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={displayedUserList}
          rowKey="id"
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng` }}
          onChange={handleTableChange}
          locale={{ emptyText: isLoading ? "Đang tải dữ liệu..." : "Không có dữ liệu" }}
        />
      </Card>

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        width={600}
        okText={editingUser ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        confirmLoading={isLoading}
        okButtonProps={{ style: { background: "#2E7D32", borderColor: "#2E7D32", borderRadius: "6px" } }}
        cancelButtonProps={{ style: { borderRadius: "6px", borderColor: "#4CAF50", color: "#2E7D32" } }}
        bodyStyle={{ padding: "24px", background: "#F5F5F5" }}
        style={{ top: 20 }}
        destroyOnClose 
      >
        <Form form={form} layout="vertical" style={{ background: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} initialValues={{ status: "active", role: "user" }} >
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
            <Input placeholder="Nhập email" style={{ borderRadius: "4px" }} disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}>
            <Input placeholder="Nhập họ và tên" style={{ borderRadius: "4px" }} />
          </Form.Item>
          <Form.Item name="phone_number" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại (VD: 0901234567)" style={{ borderRadius: "4px" }} />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
            <Select placeholder="Chọn vai trò" style={{ width: "100%" }}>
              <Option value="admin"><Tag color="red">ADMIN</Tag></Option>
              <Option value="manager"><Tag color="blue">MANAGER</Tag></Option>
              <Option value="staff"><Tag color="orange">STAFF</Tag></Option>
              <Option value="shipper"><Tag color="cyan">SHIPPER</Tag></Option>
              <Option value="user"><Tag color="green">USER</Tag></Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái hoạt động" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
            <Select placeholder="Chọn trạng thái" style={{ width: "100%" }}>
              <Option value="active"><Tag color="green">HOẠT ĐỘNG (ACTIVE)</Tag></Option>
              <Option value="inactive"><Tag color="red">KHÔNG HOẠT ĐỘNG (INACTIVE)</Tag></Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;