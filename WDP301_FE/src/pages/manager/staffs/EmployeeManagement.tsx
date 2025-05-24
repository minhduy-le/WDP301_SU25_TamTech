import React, {useState, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Modal,
  Form,
  Space,
  Tag,
  message,
  Tooltip,
  DatePicker,
  Avatar,
  Upload,   
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  UserOutlined, // Icon mặc định cho Avatar
  PhoneOutlined,
  MailOutlined,
  SafetyCertificateOutlined, // For role
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess()); 

const { Option } = Select;

interface Employee {
  employeeId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  joinDate: string; 
  dateOfBirth?: string; 
  address?: string; 
  avatarUrl?: string; 
  status: 'active' | 'inactive';
}

const ROLES = ['Quản lý', 'Nhân viên Sale', 'Nhân viên Marketing', 'Nhân viên Kho', 'Kế toán', 'Lễ tân'];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang làm việc' },
  { value: 'inactive', label: 'Đã nghỉ việc' },
];


const initialEmployees: Employee[] = [
  {
    employeeId: 'EMP001',
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phoneNumber: '0901234567',
    role: 'Quản lý',
    joinDate: dayjs().subtract(2, 'year').toISOString(),
    dateOfBirth: dayjs('1990-05-15').toISOString(),
    address: '123 Đường ABC, Quận 1, TP. HCM',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    status: 'active',
  },
  {
    employeeId: 'EMP002',
    fullName: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    phoneNumber: '0987654321',
    role: 'Nhân viên',
    joinDate: dayjs().subtract(1, 'year').toISOString(),
    dateOfBirth: dayjs('1995-10-20').toISOString(),
    address: '456 Đường XYZ, Quận 3, TP. HCM',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    status: 'active',
  },
  {
    employeeId: 'EMP003',
    fullName: 'Lê Văn Cường',
    email: 'cuong.le@example.com',
    phoneNumber: '0912345678',
    role: 'Nhân viên',
    joinDate: dayjs().subtract(6, 'month').toISOString(),
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    status: 'inactive',
  },
];


const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<string>("Tất cả");
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");
  const [form] = Form.useForm();
  // const [loading, setLoading] = useState(false);
  const [avatarFileList, setAvatarFileList] = useState<UploadFile[]>([]);


  const handleAdd = () => {
    setEditingEmployee(null);
    setSelectedEmployee(null);
    setModalMode("add");
    form.resetFields();
    form.setFieldsValue({ status: 'active', joinDate: dayjs() });
    setAvatarFileList([]);
    setModalVisible(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setSelectedEmployee(null);
    setModalMode("edit");
    form.setFieldsValue({
      ...employee,
      joinDate: employee.joinDate ? dayjs(employee.joinDate) : null,
      dateOfBirth: employee.dateOfBirth ? dayjs(employee.dateOfBirth) : null,
    });
    if (employee.avatarUrl) {
      setAvatarFileList([{ uid: '-1', name: 'avatar.png', status: 'done', url: employee.avatarUrl }]);
    } else {
      setAvatarFileList([]);
    }
    setModalVisible(true);
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditingEmployee(null);
    setModalMode("view");
    setModalVisible(true);
  };

  const handleDelete = (employeeId: string) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa nhân viên này?",
      content: "Hành động này không thể hoàn tác nếu xóa hẳn. Cân nhắc chuyển sang trạng thái 'Đã nghỉ việc'.",
      okText: "Xóa hẳn",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setEmployees((prev) => prev.filter((emp) => emp.employeeId !== employeeId));
        message.success("Đã xóa nhân viên! (Client-side)");
      },
    });
  };
  
  const handleAvatarUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setAvatarFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
        form.setFieldsValue({ avatarUpload: newFileList }); 
    } else {
        form.setFieldsValue({ avatarUpload: null });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let avatarUrl = editingEmployee?.avatarUrl || '';

      if (avatarFileList.length > 0 && avatarFileList[0].originFileObj) {
        avatarUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsDataURL(avatarFileList[0].originFileObj as Blob);
            reader.onload = () => resolve(reader.result as string);
        });
      } else if (avatarFileList.length === 0 && modalMode === 'edit') {
         if(editingEmployee && form.getFieldValue('avatarUpload') === null) avatarUrl = '';

      }


      const employeePayload: Omit<Employee, 'employeeId'> = {
        ...values,
        joinDate: (values.joinDate as Dayjs).toISOString(),
        dateOfBirth: values.dateOfBirth ? (values.dateOfBirth as Dayjs).toISOString() : undefined,
        avatarUrl: avatarUrl,
      };
      delete (employeePayload as any).password;
      delete (employeePayload as any).confirmPassword;
      delete (employeePayload as any).avatarUpload;


      if (modalMode === "add") {
        const newEmployee: Employee = {
          ...employeePayload,
          employeeId: `EMP${Date.now()}`,
        };
        setEmployees((prev) => [newEmployee, ...prev]);
        message.success("Đã thêm nhân viên! (Client-side)");
      } else if (editingEmployee) {
        const updatedEmployee: Employee = {
          ...editingEmployee,
          ...employeePayload,
        };
        setEmployees((prev) =>
          prev.map((emp) => (emp.employeeId === editingEmployee.employeeId ? updatedEmployee : emp))
        );
        message.success("Đã cập nhật thông tin nhân viên! (Client-side)");
      }
      setModalVisible(false);
      form.resetFields();
      setAvatarFileList([]);
    } catch (error: any) {
      console.error("Modal OK error:", error);
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      } else {
        message.error(`Có lỗi xảy ra: ${error.message || 'Không rõ lỗi'}`);
      }
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const searchTextLower = searchText.toLowerCase();
        return (
          emp.fullName.toLowerCase().includes(searchTextLower) ||
          emp.email.toLowerCase().includes(searchTextLower) ||
          emp.phoneNumber.includes(searchTextLower)
        );
      })
      .filter((emp) => filterRole === "Tất cả" || emp.role === filterRole)
      .filter((emp) => filterStatus === "Tất cả" || emp.status === filterStatus);
  }, [employees, searchText, filterRole, filterStatus]);

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";


  const columns = [
    {
      title: <Avatar size="small" icon={<UserOutlined />} style={{marginRight: 8, backgroundColor: 'transparent', color: headerColor}}/>,
      dataIndex: "avatarUrl",
      key: "avatar",
      width: 60,
      render: (avatarUrl: string, record: Employee) => (
        <Avatar src={avatarUrl} icon={<UserOutlined />}>
          {!avatarUrl && record.fullName ? record.fullName.charAt(0).toUpperCase() : null}
        </Avatar>
      ),
    },
    {
      title: "Họ và Tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 170,
      ellipsis: true,
      sorter: (a: Employee, b: Employee) => a.fullName.localeCompare(b.fullName),
      render: (name: string) => (
        <Tooltip title={name}>
          <span style={{ fontWeight: 600, color: "#D97B41" }}>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      ellipsis: true,
      render: (email: string) => <a href={`mailto:${email}`} style={{color: cellTextColor}}>{email}</a>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 130,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      filters: ROLES.map(role => ({text: role, value: role})),
      onFilter: (value: string | number | boolean, record: Employee) => record.role === value,
      render: (role: string) => <Tag color="#A05A2C" style={{color: '#fff', fontWeight: 500}}>{role}</Tag>,
    },
    {
      title: "Ngày vào làm",
      dataIndex: "joinDate",
      key: "joinDate",
      width: 130,
      sorter: (a: Employee, b: Employee) => dayjs(a.joinDate).diff(dayjs(b.joinDate)),
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: 'center' as const,
      filters: STATUS_OPTIONS.map(opt => ({text: opt.label, value: opt.value})),
      onFilter: (value: string | number | boolean, record: Employee) => record.status === value,
      render: (status: 'active' | 'inactive') => (
        <Tag color={status === 'active' ? "#81C784" : "#E57373"} style={{color: '#fff', fontWeight: 500 }}>
          {status === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center" as const,
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Employee) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined style={{ color: "#D97B41", fontSize: 17 }} />} onClick={() => handleView(record)} style={{ outline: "none", boxShadow: "none" }}/>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined style={{ color: "#A05A2C", fontSize: 17 }} />} onClick={() => handleEdit(record)} style={{ outline: "none", boxShadow: "none" }}/>
          </Tooltip>
          <Tooltip title="Xóa/Vô hiệu hóa">
            <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 17 }} />} onClick={() => handleDelete(record.employeeId)} style={{ outline: "none", boxShadow: "none" }}/>
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  const styledColumns = useMemo(() => columns.map(col => {
      const headerStyle : React.CSSProperties = {
        backgroundColor: headerBgColor,
        color: headerColor,
        fontWeight: 'bold',
        borderRight: `1px solid ${borderColor}`,
        borderBottom: `2px solid ${tableBorderColor}`,
      };
      if (col.key === 'avatar') { 
      }

      return {
        ...col,
        title: col.key === 'avatar' ? col.title : <span style={{color: headerColor}}>{(col as any).title}</span>, 
        onHeaderCell: () => ({ style: headerStyle }),
      };
  }), [columns]);


  return (
    <div style={{ minHeight: "100vh", background: "#FFF9F0" }}>
      <style>{`
        .ant-table-thead > tr > th { /* AntD v5 specific */
          background-color: ${headerBgColor} !important;
          color: ${headerColor} !important;
          font-weight: bold !important;
          border-right: 1px solid ${borderColor} !important;
          border-bottom: 2px solid ${tableBorderColor} !important;
        }
        .ant-table-thead > tr > th.ant-table-cell-fix-right:last-child {
            border-right: none !important;
        }
        .employee-table .ant-table-tbody > tr.even-row-emp > td {
          background-color: ${evenRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .employee-table .ant-table-tbody > tr.odd-row-emp > td {
          background-color: ${oddRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .employee-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) {
           border-right: none;
        }
        .employee-table .ant-table-tbody > tr:hover > td {
          background-color: #FDEBC8 !important;
        }
        .employee-table .ant-table-cell-fix-right {
           background: inherit !important;
        }
        .employee-table .ant-table-thead > tr > th.ant-table-cell-fix-right {
          background-color: ${headerBgColor} !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "20px 20px 20px 60px" }}>
        <h1 style={{ fontWeight: 700, color: "#A05A2C", fontSize: 32, marginBottom: 24, textAlign: "left" }}>
          Quản lý Nhân viên
        </h1>
        <Card
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(160, 90, 44, 0.08)",
            padding: "12px 24px",
            border: `1px solid ${tableBorderColor}`,
            marginBottom: 24,
          }}
        >
          <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
            <Space wrap>
              <Input
                placeholder="Tìm theo tên, email, SĐT..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280, borderRadius: 6, borderColor: "#E9C97B", height: 32, display: "flex", alignItems: "center", justifyContent: "center"}}
                allowClear
              />
              <Select
                value={filterRole}
                style={{ width: 180, borderRadius: 6 }}
                onChange={(value) => setFilterRole(value)}
                placeholder="Lọc theo vai trò"
              >
                <Option value="Tất cả">Tất cả vai trò</Option>
                {ROLES.map(role => <Option key={role} value={role}>{role}</Option>)}
              </Select>
              <Select
                value={filterStatus}
                style={{ width: 180, borderRadius: 6 }}
                onChange={(value) => setFilterStatus(value)}
                placeholder="Lọc theo trạng thái"
              >
                <Option value="Tất cả">Tất cả trạng thái</Option>
                {STATUS_OPTIONS.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
              </Select>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: "#D97B41", borderColor: "#D97B41", fontWeight: 600, borderRadius: 6 }}
              onClick={handleAdd}
            >
              Thêm nhân viên
            </Button>
          </div>
          <Table
            className="employee-table"
            columns={styledColumns as any}
            dataSource={filteredEmployees}
            // loading={loading}
            rowKey="employeeId"
            style={{ borderRadius: 8, border: `1px solid ${tableBorderColor}`, overflow: 'hidden' }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'even-row-emp' : 'odd-row-emp')}
            sticky
          />
        </Card>

        <Modal
          open={modalVisible}
          title={ <span style={{ color: "#A05A2C", fontWeight: 600, fontSize: 22 }}> {modalMode === "add" ? "Thêm mới nhân viên" : "Cập nhật thông tin nhân viên"} </span> }
          onCancel={() => { setModalVisible(false); form.resetFields(); setAvatarFileList([]); }}
          footer={
            modalMode === "view"
              ? [
                  <Button
                    key="close"
                    onClick={() => {
                      setModalVisible(false);
                    }}
                    style={{ borderRadius: 6 }}
                  >
                    Đóng
                  </Button>,
                ]
              : [
                  <Button
                    key="cancel"
                    onClick={() => {
                      setModalVisible(false);
                      form.resetFields();
                      setAvatarFileList([]);
                    }}
                    style={{ borderRadius: 6 }}
                    // disabled={isSubmitting} 
                  >
                    Hủy
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={handleModalOk}
                    style={{ background: "#D97B41", borderColor: "#D97B41", borderRadius: 6 }}
                    // loading={isSubmitting} 
                  >
                    {modalMode === "add" ? "Thêm mới" : "Cập nhật"}
                  </Button>,
                ]
          }
          width={modalMode === 'view' ? 750 : 700} 
          destroyOnHidden
          styles={{ body: { background: "#FFF9F0", borderRadius: "0 0 12px 12px", padding: "24px" } }}
          style={{ borderRadius: 12, top: 20 }}
        >
          {modalMode === 'view' && selectedEmployee ? (
            <Card bordered={false} style={{ background: "#fff", borderRadius: 8 }}>
              <Descriptions bordered layout="vertical"
                labelStyle={{ color: "#A05A2C", fontWeight: 500, background: '#FFF9F0' }} 
                contentStyle={{ color: "#555", background: '#FFFFFF' }}
              >
                <Descriptions.Item label="Ảnh đại diện" span={3} contentStyle={{textAlign: 'center'}}>
                  <Avatar size={128} src={selectedEmployee.avatarUrl} icon={<UserOutlined />} />
                </Descriptions.Item>
                <Descriptions.Item label="Họ và Tên">{selectedEmployee.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedEmployee.email}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{selectedEmployee.phoneNumber}</Descriptions.Item>
                <Descriptions.Item label="Vai trò">{selectedEmployee.role}</Descriptions.Item>
                <Descriptions.Item label="Ngày vào làm">{dayjs(selectedEmployee.joinDate).format("DD/MM/YYYY")}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {selectedEmployee.dateOfBirth ? dayjs(selectedEmployee.dateOfBirth).format("DD/MM/YYYY") : "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {selectedEmployee.address || "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={selectedEmployee.status === 'active' ? "#81C784" : "#E57373"} style={{color: '#fff'}}>
                    {selectedEmployee.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ) : ( // Form Add/Edit
            <Form form={form} layout="vertical" 
                initialValues={{ status: 'active', joinDate: dayjs() }}
                style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid #f0f0f0"}}
            >
              <Form.Item name="avatarUpload" label="Ảnh đại diện" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}>
                <Upload
                    listType="picture-card"
                    fileList={avatarFileList}
                    onChange={handleAvatarUploadChange}
                    beforeUpload={() => false} 
                    maxCount={1}
                    accept="image/*"
                >
                  {avatarFileList.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Tải lên</div></div>}
                </Upload>
              </Form.Item>

              <Space align="start" style={{ display: 'flex', width: '100%' }} size="large">
                <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true }]} style={{ flex: 1 }}>
                  <Input prefix={<UserOutlined />} placeholder="Nhập họ tên" />
                </Form.Item>
                <Form.Item name="dateOfBirth" label="Ngày sinh" style={{ flex: 1 }}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh"/>
                </Form.Item>
              </Space>

              <Space align="start" style={{ display: 'flex', width: '100%' }} size="large">
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]} style={{ flex: 1 }}>
                  <Input prefix={<MailOutlined />} placeholder="vidu@example.com" />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]} style={{ flex: 1 }}>
                  <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
                </Form.Item>
              </Space>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
              </Form.Item>

              <Space align="start" style={{ display: 'flex', width: '100%' }} size="large">
                <Form.Item name="role" label="Vai trò" rules={[{ required: true }]} style={{ flex: 1 }}>
                  <Select prefix={<SafetyCertificateOutlined />} placeholder="Chọn vai trò">
                    {ROLES.map(role => <Option key={role} value={role}>{role}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="joinDate" label="Ngày vào làm" rules={[{ required: true }]} style={{ flex: 1 }}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày vào làm" />
                </Form.Item>
              </Space>
              
              {modalMode === 'add' && ( 
                <Space align="start" style={{ display: 'flex', width: '100%' }} size="large">
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]} style={{ flex: 1 }}>
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>
                    <Form.Item name="confirmPassword" label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                        style={{ flex: 1 }}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu" />
                    </Form.Item>
                </Space>
              )}

              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select placeholder="Chọn trạng thái">
                  {STATUS_OPTIONS.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                </Select>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default EmployeeManagement;