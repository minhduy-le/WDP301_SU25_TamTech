import React, { useState, useEffect } from "react";
import {
  Table, Button, Space, Modal, Form, Input, Select, Tag, Popconfirm, message, Card, Row, Col, Statistic, DatePicker,
} from "antd";
import {
  UserAddOutlined, EditOutlined, SearchOutlined, UserOutlined, TeamOutlined, StopOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { SorterResult, FilterValue } from "antd/es/table/interface";
import axios, { AxiosError } from "axios";
import spinTamTac from "../../assets/spinTamTac.json";
import Lottie from "lottie-react";
import dayjs from "dayjs";

const { Option } = Select;

const ScopedModalStyles = () => (
  <style>{`
    /* Đặt className riêng cho Modal để CSS không ảnh hưởng toàn hệ thống */
    .user-management-form-modal .ant-form-item {
      margin-bottom: 22px; /* Khoảng cách nhất quán giữa các trường */
    }
    
    /* --- 1. Style MẶC ĐỊNH --- */
    .user-management-form-modal .ant-input,
    .user-management-form-modal .ant-input-affix-wrapper,
    .user-management-form-modal .ant-select-selector,
    .user-management-form-modal .ant-picker {
      border-color: #d9d9d9 !important; 
      box-shadow: none !important;
      transition: all 0.2s ease-in-out;
    }

    /* --- 2. VÔ HIỆU HÓA HIỆU ỨNG HOVER MẶC ĐỊNH (khi chưa focus) --- */
    /* Quy tắc này chỉ áp dụng khi control CHƯA được focus */
    .user-management-form-modal .ant-select:not(.ant-select-focused):not(.ant-select-disabled):hover .ant-select-selector,
    .user-management-form-modal .ant-picker:not(.ant-picker-focused):hover,
    .user-management-form-modal .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-focused):hover,
    .user-management-form-modal .ant-input:not(:focus):hover {
        border-color: #d9d9d9 !important; /* Giữ nguyên màu xám khi hover */
    }

    /* --- 3. Style khi CLICK VÀO (FOCUS) --- */
    /* Quy tắc này sẽ được ưu tiên khi người dùng click vào */
    .user-management-form-modal .ant-input:focus,
    .user-management-form-modal .ant-input-focused,
    .user-management-form-modal .ant-input-affix-wrapper-focused,
    .user-management-form-modal .ant-input-affix-wrapper:focus-within,
    .user-management-form-modal .ant-select-focused:not(.ant-select-disabled) .ant-select-selector,
    .user-management-form-modal .ant-picker-focused {
      border-color: #4CAF50 !important; /* Viền xanh lá */
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2) !important; /* Vầng sáng xanh lá mờ */
      outline: 0;
    }

    /* --- 4. Style cho chữ gợi ý (PLACEHOLDER) --- */
    .user-management-form-modal .ant-input::placeholder,
    .user-management-form-modal .ant-input-password::placeholder,
    .user-management-form-modal .ant-picker-input > input::placeholder,
    .user-management-form-modal .ant-select-selection-placeholder {
      color: #adb5bd !important; /* MÀU XÁM NHẠT */
      opacity: 1;
    }

    /* --- 5. ĐỔI MÀU PHÂN TRANG VÀ PLACEHOLDER TÌM KIẾM TOÀN TRANG --- */
    .ant-pagination .ant-pagination-item-active {
      border-color: #4CAF50 !important;
    }
    .ant-pagination .ant-pagination-item-active a {
      color: #4CAF50 !important;
    }
    .ant-pagination .ant-pagination-item-active:hover {
      border-color: #388e3c !important;
    }
    .ant-pagination .ant-pagination-item-active a:hover {
      color: #388e3c !important;
    }
    input[placeholder="Tìm kiếm ID, Email, Tên, ..."],
    input[placeholder="Tìm kiếm ID, Email, Tên,..."] {
      /* Đổi màu chữ placeholder sang xanh lá */
      color: #4CAF50 !important;
    }
    input[placeholder="Tìm kiếm ID, Email, Tên, ..."]::placeholder,
    input[placeholder="Tìm kiếm ID, Email, Tên,..."]::placeholder {
      color: #4CAF50 !important;
      opacity: 1;
    }
  `}</style>
);


const API_BASE_URL = "https://wdp301-su25.space/api";

// ... Các interface User, ApiAccount giữ nguyên ...
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "Admin" | "Manager" | "Staff" | "Shipper" | "User";
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
    let appUserRole: User["role"] = "User";
    const apiRoleLower = apiAccount.role?.toLowerCase();

    if (apiRoleLower === "admin") appUserRole = "Admin";
    else if (apiRoleLower === "manager") appUserRole = "Manager";
    else if (apiRoleLower === "staff") appUserRole = "Staff";
    else if (apiRoleLower === "shipper") appUserRole = "Shipper";
    else if (apiRoleLower === "user") appUserRole = "User";
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
      date_of_birth: apiAccount.date_of_birth
        ? dayjs(apiAccount.date_of_birth).format("YYYY-MM-DD")
        : "N/A",
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
      title: "Vai trò", dataIndex: "role", key: "role", width: 120, align: "center",
      render: (role: User["role"]) => {
        let color = "default"; let displayText = role.toUpperCase();
        switch (role) {
          case "Admin": color = "red"; break;
          case "Manager": color = "blue"; break;
          case "Staff": color = "orange"; break;
          case "Shipper": color = "cyan"; break;
          case "User": color = "green"; break;
        }
        return <Tag color={color}>{displayText}</Tag>;
      },
      filters: [ { text: "Admin", value: "admin" }, { text: "Manager", value: "manager" }, { text: "Staff", value: "staff" }, { text: "Shipper", value: "shipper" }, { text: "User", value: "user" }, ],
      filteredValue: filteredTableInfo.role || null, onFilter: (value, record) => record.role === value, ellipsis: true,
    },
    { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number", width: 150, ellipsis: true, align: "center" },
    {
      title: "Trạng thái", dataIndex: "status", key: "status", width: 120, align: "center",
      render: (status: User["status"]) => (<Tag color={status === "active" ? "green" : "red"}>{status.toUpperCase()}</Tag>),
      filters: [ { text: "Hoạt động", value: "active" }, { text: "Không hoạt động", value: "inactive" }, ],
      filteredValue: filteredTableInfo.status || null, onFilter: (value, record) => record.status === value, ellipsis: true,
    },
    {
      title: "Thao tác", key: "action", width: 160, fixed: "right", align: "center",
      render: (_, userRecord) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditUser(userRecord)} style={{ background: "#2E7D32", borderColor: "#2E7D32", borderRadius: "6px", outline: 'none' }} />
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${userRecord.status === "active" ? "khóa" : "mở khóa"} tài khoản ${userRecord.fullName}?`}
            onConfirm={() => handleToggleUserBanStatus(userRecord)}
            okText="Có" cancelText="Không"
            okButtonProps={{ style: {outline: 'none', background: userRecord.status === "active" ? "#d32f2f" : "#2E7D32", borderColor: userRecord.status === "active" ? "#d32f2f" : "#2E7D32", borderRadius: "6px" } }}
            cancelButtonProps={{ style: { borderRadius: "6px", outline: 'none' } }}
          >
            <Button danger={userRecord.status === "active"} icon={userRecord.status === "active" ? <StopOutlined /> : <CheckCircleOutlined />} style={{ borderRadius: "6px", background: userRecord.status === "active" ? "" : "#2E7D32", color: userRecord.status === "active" ? "" : "white", borderColor: userRecord.status === "active" ? "" : "#2E7D32", outline: 'none' }} >
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
    form.setFieldsValue({
      status: "active", 
      role: "user", 
    });
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
      date_of_birth:
        userToEdit.date_of_birth && userToEdit.date_of_birth !== "N/A"
          ? dayjs(userToEdit.date_of_birth, "YYYY-MM-DD")
          : null,
      note: userToEdit._apiNote,
    });
    setIsModalVisible(true);
  };

  const handleToggleUserBanStatus = async (userToToggle: User) => {
    const isCurrentlyActiveAndNotBanned = userToToggle._apiIsActive === true && userToToggle._apiIsBan === false;
    const newIsBan = isCurrentlyActiveAndNotBanned;
    const newIsActive = !newIsBan;

    const payloadForApi = {
      fullName: userToToggle.fullName,
      email: userToToggle.email,
      phone_number: userToToggle.phone_number || "",
      date_of_birth:
        userToToggle.date_of_birth && userToToggle.date_of_birth !== "N/A"
          ? dayjs(userToToggle.date_of_birth).format("YYYY-MM-DD")
          : null,
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

      const statusIsActive = formValues.status === "active";
      const apiIsActive = statusIsActive;
      const apiIsBan = !statusIsActive;

      let payloadForApi: Partial<ApiAccount> & { password?: string };

      if (editingUser) {
        payloadForApi = {
          fullName: formValues.fullName,
          email: editingUser.email,
          phone_number: formValues.phone_number || "",
          date_of_birth: formValues.date_of_birth
            ? dayjs(formValues.date_of_birth).format("YYYY-MM-DD")
            : null,
          note: formValues.note || null,
          role: formValues.role,
          isActive: apiIsActive,
          isBan: apiIsBan,
          member_point: editingUser._apiMemberPoint || 0,
          member_rank: editingUser._apiMemberRank || 0,
        };
        if (formValues.password) {
          payloadForApi.password = formValues.password;
        }

        await axios.put(`${API_BASE_URL}/accounts/${editingUser.id}`, payloadForApi, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Cập nhật người dùng thành công!");
      } else {
        payloadForApi = {
          fullName: formValues.fullName,
          email: formValues.email,
          password: formValues.password,
          phone_number: formValues.phone_number || "",
          date_of_birth: formValues.date_of_birth
            ? dayjs(formValues.date_of_birth).format("YYYY-MM-DD")
            : null,
          note: formValues.note || "",
          role: formValues.role,
          isActive: apiIsActive,
          isBan: apiIsBan, 
          member_point: 0,
          member_rank: 0,
        };
        await axios.post(`${API_BASE_URL}/accounts`, payloadForApi, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Thêm người dùng thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchUserList();
    } catch (error) {
        const axiosError = error as AxiosError;
        if ((error as any).errorFields && (error as any).errorFields.length > 0) {
            console.log("Form validation failed:", (error as any).errorFields);
            message.error("Vui lòng kiểm tra lại các trường đã nhập.");
        } 
        else if (axiosError.isAxiosError && axiosError.response?.data) {
            const apiErrors = axiosError.response.data as any;
            let errorMessage = "Error: ";

            if (typeof apiErrors === "string") {
                errorMessage += ` ${apiErrors}`;
            } else if (typeof apiErrors.message === 'string') {
                errorMessage += ` ${apiErrors.message}`;
            } else if (typeof apiErrors.message === 'object') {
                const fieldErrors = Object.entries(apiErrors.message).map(([field, msg]) =>
                    `${field}: ${(Array.isArray(msg) ? msg.join(', ') : msg)}`
                ).join('; ');
                errorMessage += ` ${fieldErrors}`;
            } else if (Array.isArray(apiErrors.message)) {
                 errorMessage += ` ${apiErrors.message.join(', ')}`;
            } else if (typeof apiErrors === 'object' && !apiErrors.message) {
                 const fieldErrors = Object.entries(apiErrors).map(([field, messages]) => {
                    if (Array.isArray(messages) && messages.length > 0) {
                        return `${field}: ${messages.join(', ')}`;
                    }
                    return `${field}: ${messages}`;
                }).join('; ');
                errorMessage += ` ${fieldErrors || "Lỗi không xác định từ API."}`;
            }
             else {
                errorMessage += ` ${axiosError.message || "Lỗi không xác định"}`;
            }
            message.error(errorMessage);
            console.error("API Error:", axiosError.response?.data || axiosError.message);
        } else {
            console.log("Submit Failed or Other error:", error);
            message.error(`Thao tác thất bại: ${(error as Error).message || "Lỗi không xác định"}`);
        }
    } finally {
      setIsLoading(false);
    }
  };
  
  const displayedUserList = userList.filter((user) => {
    const searchTextLower = searchText.toLowerCase();
    return (
      String(user.id).toLowerCase().includes(searchTextLower) ||
      String(user.username).toLowerCase().includes(searchTextLower) ||
      String(user.email).toLowerCase().includes(searchTextLower) ||
      String(user.fullName).toLowerCase().includes(searchTextLower) ||
      String(user.role).toLowerCase().includes(searchTextLower) ||
      String(user.status).toLowerCase().includes(searchTextLower) ||
      String(user.phone_number || "").toLowerCase().includes(searchTextLower)
    );
  });

  const userStats = {
    totalUsers: userList.length,
    activeUsers: userList.filter((user) => user.status === "active").length,
    managers: userList.filter((user) => user.role === "Manager").length,
    staffCount: userList.filter((user) => user.role === "Staff").length,
    shipperCount: userList.filter((user) => user.role === "Shipper").length,
  };

  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b$/;

  return (
    <div style={{ padding: "24px", position: "relative", minHeight: "80vh" }}>
      <ScopedModalStyles /> 
      {isLoading && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
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
          <Button type="primary" icon={<UserAddOutlined />} onClick={handleAddUser} style={{ background: "#2E7D32", borderColor: "#2E7D32", borderRadius: "6px", outline: "none" }}>
            Thêm người dùng
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={displayedUserList}
          rowKey="id"
          scroll={{ x: 1300 }}
          onChange={handleTableChange}
          locale={{ emptyText: isLoading ? "Đang tải dữ liệu..." : "Không có dữ liệu" }}
        />
      </Card>

      <Modal
        className="user-management-form-modal"
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); setEditingUser(null); }}
        width={600}
        okText={editingUser ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        confirmLoading={isLoading}
        okButtonProps={{ style: { background: "#2E7D32", borderColor: "#2E7D32", borderRadius: "6px", outline: "none" } }}
        cancelButtonProps={{ style: { borderRadius: "6px", borderColor: "#4CAF50", color: "#2E7D32", outline: "none" } }}
        bodyStyle={{ padding: "24px", background: "#F5F5F5" }}
        style={{ top: 20 }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ background: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <Form.Item name="email" label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" }
            ]}
            style = {{margin: "0px"}}
          >
            <Input placeholder="Nhập email" disabled={!!editingUser} style={{ marginBottom: "16px"}}/>
          </Form.Item>

          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }, { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" }]} style={{ margin: "0px"}}>
            <Input placeholder="Nhập họ và tên" style={{ marginBottom: "16px"}}/>
          </Form.Item>
          
          <Form.Item
            name="phone_number"
            label="Số điện thoại"
            rules={[
              { pattern: phoneRegex, message: "Số điện thoại không hợp lệ (VD: 0901234567)" },
            ]}
            style={{ margin: "0px"}}
          >
            <Input placeholder="Nhập số điện thoại (VD: 0901234567)" style={{ marginBottom: "16px"}}/>
          </Form.Item>
          <Row gutter={[16, 16]}>
            <Col span={12}>
            <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
            <Select placeholder="Chọn vai trò">
              <Option value="Admin"><Tag color="red">ADMIN</Tag></Option>
              <Option value="Staff"><Tag color="orange">STAFF</Tag></Option>
              <Option value="Shipper"><Tag color="cyan">SHIPPER</Tag></Option>
              <Option value="User"><Tag color="green">USER</Tag></Option>
            </Select>
          </Form.Item>
            </Col>
            <Col span={12}>
            <Form.Item name="status" label="Trạng thái hoạt động" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="active"><Tag color="green">HOẠT ĐỘNG</Tag></Option>
              <Option value="inactive"><Tag color="red">KHÔNG HOẠT ĐỘNG</Tag></Option>
            </Select>
          </Form.Item>
            </Col>
          </Row>
            <Row gutter={[16, 16]}>
              {!editingUser && (
                <Col span={12}>
                  <Form.Item
            name="password"
            label={"Mật khẩu"}
            rules={[
              { required: !editingUser, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
            style={{ margin: "0px"}}
            hasFeedback
          >
            <Input.Password placeholder={ "Nhập mật khẩu"} style={{ marginBottom: "16px", height: "40px"}}/>
          </Form.Item>
                </Col>
              )}
          <Col span={12}>
          <Form.Item name="date_of_birth" label="Ngày sinh" style={{ margin: "0px"}}>
            <DatePicker
              style={{ width: "100%", height: "40px", marginBottom: "16px", outline: "none"}}
              placeholder="Chọn ngày sinh (YYYY-MM-DD)"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          </Col>
          </Row>
          
          <Form.Item name="note" label="Ghi chú" rules={[{ message: "Ghi chú không quá 255 ký tự" }]}>
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;