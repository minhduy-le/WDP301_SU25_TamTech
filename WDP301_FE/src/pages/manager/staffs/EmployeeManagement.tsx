import React, { useState, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Space,
  Tag,
  Tooltip,
  Modal,
  Spin,
} from "antd";
import { SearchOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DetailManageStaff from "./DetailManageStaff";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());


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
  status: "active" | "inactive";
}

export interface Account {
  id: number;
  fullName: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  note: string | null;
  role: "Manager" | "Staff" | "Shipper" | "User" | string;
  isActive: boolean;
}

const headerColor = "#A05A2C";
const headerBgColor = "#F9E4B7";
const evenRowBgColor = "#FFFDF5";
const oddRowBgColor = "#FFF7E6";
const cellTextColor = "#5D4037";
const borderColor = "#F5EAD9";
const tableBorderColor = "#E9C97B";

const fetchAccounts = async (): Promise<Account[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  const res = await axios.get(`${import.meta.env.VITE_API_URL}accounts`, {
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
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<string>("Tất cả");
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleShowDetail = async (employeeId: string) => {
    setDetailModalVisible(true);
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}accounts/${employeeId}`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDetailData(res.data.data);
    } catch (err) {
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const employees = useMemo((): Employee[] => {
    if (!accounts) return [];
    return accounts
      .filter((acc) => acc.role === "Staff" || acc.role === "Shipper")
      .map(
        (acc): Employee => ({
          employeeId: acc.id.toString(),
          fullName: acc.fullName,
          email: acc.email,
          phoneNumber: acc.phone_number,
          role: acc.role,
          joinDate: acc.date_of_birth,
          dateOfBirth: acc.date_of_birth,
          address: acc.note || "",
          avatarUrl: "",
          status: acc.isActive ? "active" : "inactive",
        })
      );
  }, [accounts]);

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
      .filter(
        (emp) => filterStatus === "Tất cả" || emp.status === filterStatus
      );
  }, [employees, searchText, filterRole, filterStatus]);

  const columns = [
    {
      title: "ID",
      dataIndex: "employeeId",
      key: "employeeId",
      width: 80,
      sorter: (a: Employee, b: Employee) =>
        a.employeeId.localeCompare(b.employeeId),
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a: Employee, b: Employee) =>
        a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      sorter: (a: Employee, b: Employee) => a.email.localeCompare(b.email),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a: Employee, b: Employee) =>
        a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "Shipper" ? "blue" : "green"}>{role}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đang làm việc" : "Đã nghỉ"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center" as const,
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: Employee) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              style={{
                color: "#D97B41",
                fontWeight: 600,
                padding: "4px 8px",
                height: "auto",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                borderRadius: 6,
                border: "1px solid #D97B41",
                background: "#FFF9F0",
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onClick={() => handleShowDetail(record.employeeId)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#D97B41";
                e.currentTarget.style.color = "#FFF9F0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFF9F0";
                e.currentTarget.style.color = "#D97B41";
              }}
            >
              Chi tiết
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9F0" }}>
      <style>{`
        .ant-table-thead > tr > th { 
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
        .ant-input-number:focus, .ant-input-number-focused, .ant-input-number:hover,
        .ant-select-focused .ant-select-selector, .ant-select-selector:focus, .ant-select-selector:hover,
        .ant-picker:focus, .ant-picker:hover, .ant-input:focus, .ant-input:hover,
        .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus-within {
          border-color: #D97B41 !important; 
          box-shadow: none !important;
        }
        .ant-pagination .ant-pagination-item-active, 
        .ant-pagination .ant-pagination-item-active a { 
          border-color: #D97B41 !important; 
          color: #D97B41 !important; 
        }
        .ant-select-selector { 
          border-color: #E9C97B !important; 
        }
        .ant-select-selector:hover { 
          border-color: #D97B41 !important; 
        }
        .ant-table-column-sorter-up.active svg,
        .ant-table-column-sorter-down.active svg {
          color: #D97B41 !important;
          fill: #D97B41 !important;
        }
      `}</style>

      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "5px 20px 20px 60px",
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            color: "#A05A2C",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
            paddingTop: 0,  
            marginTop: 15,
          }}
        >
          Quản lý Nhân viên <UserOutlined />
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
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space wrap>
              <Input
                placeholder="Tìm theo tên, email, SĐT..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 280,
                  height: 32,
                  borderRadius: 6,
                  border: "1.5px solid #E9C97B",
                  boxShadow: "0 0 1px 0 #E9C97B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                allowClear
              />
              <Select
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: 160 }}
                options={[
                  { value: "Tất cả", label: "Tất cả vai trò" },
                  { value: "Staff", label: "Staff" },
                  { value: "Shipper", label: "Shipper" },
                ]}
              />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 160 }}
                options={[
                  { value: "Tất cả", label: "Tất cả trạng thái" },
                  { value: "active", label: "Đang làm việc" },
                  { value: "inactive", label: "Đã nghỉ" },
                ]}
              />
            </Space>
          </div>
          <Table
            className="employee-table"
            columns={columns as any}
            dataSource={filteredEmployees}
            loading={isLoading}
            rowKey="employeeId"
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "even-row-emp" : "odd-row-emp"
            }
            sticky
          />
        </Card>

      </div>
      <Modal
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setDetailData(null);
        }}
        footer={null}
        width={500}
        title={<span style={{ color: "#A05A2C", fontWeight: 600, fontSize: 22 }}>Chi tiết nhân viên</span>}
        destroyOnClose
      >
        {loadingDetail ? (
          <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
        ) : detailData ? (
          <DetailManageStaff account={detailData} />
        ) : (
          <div style={{ color: "red", textAlign: "center" }}>Không thể tải dữ liệu nhân viên.</div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeManagement;
