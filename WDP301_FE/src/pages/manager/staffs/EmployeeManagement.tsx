import React, { useState, useMemo } from "react";
import {
  Table, Button, Input, Select, Card, Modal, Form, Space, Tag, message, Tooltip
} from "antd";
import {
   SearchOutlined, EyeOutlined, MailOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useQuery } from "@tanstack/react-query"; 
import axios from "axios";

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

export interface Account {
  id: number;
  fullName:string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  note: string | null;
  role: "Manager" | "Staff" | "Shipper" | "User" | string;
  isActive: boolean;
}


const fetchAccounts = async (): Promise<Account[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  const res = await axios.get("https://wdp-301-0fd32c261026.herokuapp.com/api/accounts", {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
};

export const useAccounts = () =>
  useQuery<Account[], Error>({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

const EmployeeManagement: React.FC = () => {
  const { data: accounts = [], isLoading } = useAccounts();

  const employees = useMemo((): Employee[] => {
    if (!accounts) return [];
    return accounts
      .filter(acc => acc.role === "Staff" || acc.role === "Shipper")
      .map((acc): Employee => ({
        employeeId: acc.id.toString(),
        fullName: acc.fullName,
        email: acc.email,
        phoneNumber: acc.phone_number,
        role: acc.role,
        joinDate: acc.date_of_birth, 
        dateOfBirth: acc.date_of_birth,
        address: acc.note || '',
        avatarUrl: '', 
        status: acc.isActive ? 'active' : 'inactive',
      }));
  }, [accounts]);

  const [searchText, setSearchText] = useState("");
  const [filterRole] = useState<string>("Tất cả");
  const [filterStatus] = useState<string>("Tất cả");

  const [_modalVisible, setModalVisible] = useState(false);
  const [_editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [, setSelectedEmployee] = useState<Employee | null>(null);
  const [_modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportForm] = Form.useForm();
  const [selectedReportEmployee, setSelectedReportEmployee] = useState<Employee | null>(null);
  const [_reports, setReports] = useState<any[]>([]); 

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



  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditingEmployee(null);
    setModalMode("view");
    setModalVisible(true);
  };


  const handleReport = (employee: Employee) => {
    setSelectedReportEmployee(employee);
    setReportModalVisible(true);
    reportForm.resetFields();
  };

  const handleSendReport = async () => {
    try {
      const values = await reportForm.validateFields();
      const report = {
        ...values,
        employeeId: selectedReportEmployee?.employeeId,
        employeeName: selectedReportEmployee?.fullName,
        date: new Date().toLocaleString(),
      };
      setReports(prev => [...prev, report]);
      setReportModalVisible(false);
      reportForm.resetFields();
      message.success("Đã gửi báo cáo thành công!");
    } catch (err) {
      console.error("Error sending report:", err);
      message.error("Gửi báo cáo thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  const tableBorderColor = "#E9C97B";

  const columns = [
    { title: "ID", dataIndex: "employeeId", key: "employeeId", width: 80, sorter: (a: Employee, b: Employee) => a.employeeId.localeCompare(b.employeeId) },
    { title: "Họ tên", dataIndex: "fullName", key: "fullName", sorter: (a: Employee, b: Employee) => a.fullName.localeCompare(b.fullName), filters: Array.from(new Set(employees.map(e => e.fullName))).map(name => ({ text: name, value: name })), onFilter: (value: string | number | boolean, record: Employee) => record.fullName === value },
    { title: "Email", dataIndex: "email", key: "email", width: 200, sorter: (a: Employee, b: Employee) => a.email.localeCompare(b.email), filters: Array.from(new Set(employees.map(e => e.email))).map(email => ({ text: email, value: email })), onFilter: (value: string | number | boolean, record: Employee) => record.email === value },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber", sorter: (a: Employee, b: Employee) => a.phoneNumber.localeCompare(b.phoneNumber), filters: Array.from(new Set(employees.map(e => e.phoneNumber))).map(phone => ({ text: phone, value: phone })), onFilter: (value: string | number | boolean, record: Employee) => record.phoneNumber === value },
    { title: "Vai trò", dataIndex: "role", key: "role", render: (role: string) => <Tag color={role === 'Shipper' ? 'blue' : 'green'}>{role}</Tag>, filters: [ { text: 'Staff', value: 'Staff' }, { text: 'Shipper', value: 'Shipper' } ], onFilter: (value: string | number | boolean, record: Employee) => record.role === value },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'Đang làm việc' : 'Đã nghỉ'}</Tag>, filters: [ { text: 'Đang làm việc', value: 'active' }, { text: 'Đã nghỉ', value: 'inactive' } ], onFilter: (value: string | number | boolean, record: Employee) => record.status === value },
    {
      title: "Hành động", key: "actions", align: "center" as const, width: 150, fixed: 'right' as const,
      render: (_: any, record: Employee) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết"><Button style={{ borderColor: "#F9E4B7", outline: "none" }} type="text" icon={<EyeOutlined style={{ color: "#D97B41", fontSize: 17 }} />} onClick={() => handleView(record)} /></Tooltip>
          <Tooltip title="Gửi báo cáo"><Button style={{ borderColor: "#F9E4B7", outline: "none" }} type="text" icon={<MailOutlined style={{ color: "#A05A2C", fontSize: 17 }} />} onClick={() => handleReport(record)} /></Tooltip>
        </Space>
      ),
    },
  ];
  
  
  return (
    <div style={{ minHeight: "100vh", background: "#FFF9F0" }}>
      <style>{`
        .employee-table {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(160, 90, 44, 0.08);
          padding: 12px 24px;
          border: 1px solid #E9C97B;
          margin-bottom: 24px;
        }
        .ant-pagination .ant-pagination-item-active {
          border-color: #D97B41 !important;
        }
        .ant-pagination .ant-pagination-item-active a {
          color: #D97B41 !important;
        }
        .ant-pagination .ant-pagination-item-active:hover {
          border-color: #f97316 !important;
        }
        .ant-pagination .ant-pagination-item-active a:hover {
          color: #f97316 !important;
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
                style={{ width: 280, borderRadius: 6, border: "1.5px solid #E9C97B", boxShadow: "0 0 1px 0 #E9C97B", height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}
                allowClear
              />
            </Space>
          </div>
          <Table
            className="employee-table"
            columns={columns as any}
            dataSource={filteredEmployees}
            loading={isLoading}
            rowKey="employeeId"
            style={{ borderRadius: 8, border: `1px solid ${tableBorderColor}`, overflow: 'hidden' }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'even-row-emp' : 'odd-row-emp')}
            sticky
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhân viên`,
            }}
          />
        </Card>

        <Modal
          open={reportModalVisible}
          title={<span style={{ color: "#A05A2C", fontWeight: 600, fontSize: 20 }}>Gửi báo cáo về nhân viên</span>}
          onCancel={() => setReportModalVisible(false)}
          onOk={handleSendReport}
          okText="Gửi báo cáo"
        >
          <Form form={reportForm} layout="vertical">
            <Form.Item name="type" label="Loại báo cáo" rules={[{ required: true, message: "Vui lòng chọn loại báo cáo!" }]}> 
              <Select placeholder="Chọn loại báo cáo">
                <Option value="performance">Hiệu suất làm việc</Option>
                <Option value="violation">Vi phạm/quên quy trình</Option>
                <Option value="suggestion">Đề xuất thưởng/phạt</Option>
              </Select>
            </Form.Item>
            <Form.Item name="content" label="Nội dung báo cáo" rules={[{ required: true, message: "Vui lòng nhập nội dung báo cáo!" }]}> 
              <Input.TextArea rows={4} placeholder="Nhập nội dung báo cáo..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default EmployeeManagement;