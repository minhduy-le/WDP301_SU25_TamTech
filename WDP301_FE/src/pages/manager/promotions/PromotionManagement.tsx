import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Modal,
  Form,
  InputNumber,
  Space,
  Tag,
  message,
  Tooltip,
  DatePicker,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  CalendarOutlined,
  PercentageOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Promotion {
  promotionId: string;
  name: string;
  description: string;
  code?: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const initialPromotions: Promotion[] = [
  {
    promotionId: "PROMO001",
    name: "Giảm giá cuối tuần",
    description: "Giảm 20% cho tất cả đơn hàng vào thứ 7 và Chủ nhật.",
    code: "WEEKEND20",
    discountType: "percentage",
    discountValue: 20,
    startDate: dayjs().subtract(5, "day").toISOString(),
    endDate: dayjs().add(2, "day").toISOString(),
    isActive: true,
  },
  {
    promotionId: "PROMO002",
    name: "Chào hè rực rỡ",
    description: "Giảm 50,000đ cho đơn hàng từ 300,000đ.",
    discountType: "fixed_amount",
    discountValue: 50000,
    startDate: dayjs().toISOString(),
    endDate: dayjs().add(1, "month").toISOString(),
    isActive: true,
  },
  {
    promotionId: "PROMO003",
    name: "Khuyến mãi tháng 4",
    description: "Khuyến mãi đã hết hạn.",
    code: "APRILDEAL",
    discountType: "percentage",
    discountValue: 15,
    startDate: dayjs().subtract(2, "month").toISOString(),
    endDate: dayjs().subtract(1, "month").toISOString(),
    isActive: false,
  },
];

const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");
  const [form] = Form.useForm();
  // const [loading, setLoading] = useState(false); // loading cho Table nếu có fetch API
  const [isSubmitting, setIsSubmitting] = useState(false); // loading cho nút submit modal


  const getPromotionStatus = (
    promotion: Promotion
  ): { text: string; color: string } => {
    const now = dayjs();
    const startDate = dayjs(promotion.startDate);
    const endDate = dayjs(promotion.endDate);

    if (!promotion.isActive) {
      return { text: "Không hoạt động", color: "#B0A8A8" };
    }
    if (now.isAfter(endDate)) {
      return { text: "Đã kết thúc", color: "#E57373" };
    }
    if (now.isBefore(startDate)) {
      return { text: "Sắp diễn ra", color: "#64B5F6" };
    }
    return { text: "Đang diễn ra", color: "#81C784" };
  };

  const handleAdd = () => {
    setEditingPromotion(null);
    setSelectedPromotion(null);
    setModalMode("add");
    form.resetFields();
    form.setFieldsValue({ isActive: true, discountType: "percentage" });
    setModalVisible(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setSelectedPromotion(null);
    setModalMode("edit");
    form.setFieldsValue({
      ...promotion,
      dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)],
    });
    setModalVisible(true);
  };

  const handleView = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setEditingPromotion(null);
    setModalMode("view");
    setModalVisible(true);
  };

  const handleDelete = (promotionId: string) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa khuyến mãi này?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setPromotions((prev) =>
          prev.filter((p) => p.promotionId !== promotionId)
        );
        message.success("Đã xóa khuyến mãi! (Client-side)");
      },
    });
  };

  const handleModalOk = async () => {
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      const { dateRange, ...restValues } = values;

      const promotionPayload: Omit<Promotion, "promotionId"> = {
        ...restValues,
        startDate: (dateRange[0] as Dayjs).toISOString(),
        endDate: (dateRange[1] as Dayjs).toISOString(),
      };

      if (modalMode === "add") {
        const newPromotion: Promotion = {
          ...promotionPayload,
          promotionId: `PROMO${Date.now()}`,
        };
        setPromotions((prev) => [newPromotion, ...prev]);
        message.success("Đã thêm khuyến mãi! (Client-side)");
      } else if (editingPromotion) {
        const updatedPromotion: Promotion = {
          ...editingPromotion,
          ...promotionPayload,
        };
        setPromotions((prev) =>
          prev.map((p) =>
            p.promotionId === editingPromotion.promotionId
              ? updatedPromotion
              : p
          )
        );
        message.success("Đã cập nhật khuyến mãi! (Client-side)");
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      console.error("Modal OK error:", error);
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      } else {
        message.error("Có lỗi xảy ra!");
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredPromotions = useMemo(() => {
    return promotions
      .filter(
        (promo) =>
          promo.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (promo.code &&
            promo.code.toLowerCase().includes(searchText.toLowerCase()))
      )
      .filter((promo) => {
        if (statusFilter === "Tất cả") return true;
        const status = getPromotionStatus(promo).text;
        return status === statusFilter;
      });
  }, [promotions, searchText, statusFilter]);

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037"; // Màu chữ chung cho các ô trong bảng
  const borderColor = "#F5EAD9";   // Viền giữa các ô
  const tableBorderColor = "#E9C97B"; // Viền ngoài của bảng và dưới header

  const columns = [
    {
      title: "Tên khuyến mãi", // Tiêu đề là chuỗi đơn giản
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
      sorter: (a: Promotion, b: Promotion) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Tooltip title={name}>
          <span style={{ fontWeight: 600, color: "#D97B41" }}>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 120,
      ellipsis: true,
      render: (code?: string) =>
        code ? (
          <Tag color="#A05A2C" style={{color: '#fff', fontWeight: 500}}>{code}</Tag>
        ) : (
          <span style={{ color: "#aaa" }}>Không có</span>
        ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountValue",
      key: "discount",
      width: 130,
      align: 'right' as const,
      sorter: (a: Promotion, b: Promotion) => a.discountValue - b.discountValue,
      render: (value: number, record: Promotion) => (
        <span style={{ color: "#A05A2C", fontWeight: 500 }}>
          {record.discountType === "percentage"
            ? `${value}%`
            : `${value.toLocaleString()}đ`}
        </span>
      ),
    },
    {
      title: "Thời gian",
      key: "duration",
      width: 220,
      sorter: (a: Promotion, b: Promotion) =>
        dayjs(a.startDate).diff(dayjs(b.startDate)),
      render: (_: any, record: Promotion) => (
        <div>
          <span style={{ display: "block", fontSize: "13px" }}>
            BĐ: {dayjs(record.startDate).format("DD/MM/YYYY HH:mm")}
          </span>
          <span style={{ display: "block", fontSize: "13px" }}>
            KT: {dayjs(record.endDate).format("DD/MM/YYYY HH:mm")}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      align: "center" as const,
      filters: [
        { text: "Đang diễn ra", value: "Đang diễn ra" },
        { text: "Sắp diễn ra", value: "Sắp diễn ra" },
        { text: "Đã kết thúc", value: "Đã kết thúc" },
        { text: "Không hoạt động", value: "Không hoạt động" },
      ],
      onFilter: (value: string | number | boolean, record: Promotion) =>
        getPromotionStatus(record).text === value,
      render: (_: any, record: Promotion) => {
        const status = getPromotionStatus(record);
        return (
          <Tag
            color={status.color}
            style={{ fontWeight: 500, padding: "3px 8px", borderRadius: "6px", color: '#fff' }}
          >
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center" as const,
      width: 120,
      fixed: "right" as const,
      render: (_: any, record: Promotion) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#D97B41", fontSize: 17 }} />} 
              onClick={() => handleView(record)}
              style={{ outline: "none", boxShadow: "none" }} 
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#A05A2C", fontSize: 17 }} />} 
              onClick={() => handleEdit(record)}
              style={{ outline: "none", boxShadow: "none" }} 
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined style={{ fontSize: 17 }} />} 
              onClick={() => handleDelete(record.promotionId)}
              style={{ outline: "none", boxShadow: "none" }} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  const statusFilterOptions = [
    "Tất cả",
    "Đang diễn ra",
    "Sắp diễn ra",
    "Đã kết thúc",
    "Không hoạt động",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF9F0",
        padding: "20px 30px 30px 60px", // Giữ nguyên padding bạn đã đặt
      }}
    >
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
        .promo-table .ant-table-tbody > tr.even-row-promo > td {
          background-color: ${evenRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .promo-table .ant-table-tbody > tr.odd-row-promo > td {
          background-color: ${oddRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .promo-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) {
           border-right: none;
        }
        .promo-table .ant-table-tbody > tr:hover > td {
          background-color: #FDEBC8 !important;
        }
        .promo-table .ant-table-cell-fix-right {
           background: inherit !important;
        }
        .promo-table .ant-table-thead > tr > th.ant-table-cell-fix-right {
          background-color: ${headerBgColor} !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#A05A2C", // Đồng bộ màu tiêu đề chính
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          Quản lý Khuyến mãi
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
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space>
              <Input
                placeholder="Tìm theo tên, mã KM..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280, borderRadius: 6, borderColor: "#E9C97B", height: 32, display: "flex", alignItems: "center", justifyContent: "center"}}
                allowClear
              />
              <Select
                value={statusFilter}
                style={{ width: 200, borderRadius: 6 }}
                onChange={(value) => setStatusFilter(value)}
              >
                {statusFilterOptions.map((opt) => (
                  <Option key={opt} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: "#D97B41",
                borderColor: "#D97B41",
                fontWeight: 600,
                borderRadius: 6,
                boxShadow: "0 2px 0 rgba(0,0,0,0.043)",
              }}
              onClick={handleAdd}
            >
              Thêm khuyến mãi
            </Button>
          </div>
          <Table
            className="promo-table" 
            columns={columns as ColumnType<Promotion>[]}
            dataSource={filteredPromotions}
            loading={isSubmitting} 
            rowKey="promotionId"
            style={{
                borderRadius: 8, 
                border: `1px solid ${tableBorderColor}`,
                overflow: 'hidden', 
            }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'even-row-promo' : 'odd-row-promo')}
            sticky
          />
        </Card>
        <Modal
          open={modalVisible}
          title={
            <span style={{ color: "#A05A2C", fontWeight: 600, fontSize: 22 }}>
              {modalMode === "view"
                ? "Chi tiết khuyến mãi"
                : modalMode === "add"
                ? "Thêm khuyến mãi mới"
                : "Chỉnh sửa khuyến mãi"}
            </span>
          }
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={
            modalMode === "view"
              ? [
                  <Button
                    key="close"
                    onClick={() => setModalVisible(false)}
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
                    }}
                    style={{ borderRadius: 6 }}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={handleModalOk}
                    loading={isSubmitting}
                    style={{
                      background: "#D97B41",
                      borderColor: "#D97B41",
                      borderRadius: 6,
                    }}
                  >
                    {modalMode === "add" ? "Thêm mới" : "Cập nhật"}
                  </Button>,
                ]
          }
          width={modalMode === "view" ? 700 : 650}
          destroyOnHidden
          styles={{
            body: {
              background: "#FFF9F0",
              borderRadius: "0 0 12px 12px",
              padding: "24px",
            },
          }}
          style={{ borderRadius: 12, top: 20 }}
        >
          {modalMode === "view" && selectedPromotion ? (
            <Card
              bordered={false}
              style={{ background: "#fff", borderRadius: 8, padding: 0 }}
            >
              <Descriptions
                bordered
                column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{ color: "#A05A2C", fontWeight: 500, width: "180px", background: '#FFF9F0' }}
                contentStyle={{ color: "#555", background: '#FFFFFF' }}
              >
                <Descriptions.Item label="Tên khuyến mãi"> {selectedPromotion.name} </Descriptions.Item>
                <Descriptions.Item label="Mô tả"> {selectedPromotion.description} </Descriptions.Item>
                {selectedPromotion.code && ( <Descriptions.Item label="Mã khuyến mãi"> {selectedPromotion.code} </Descriptions.Item> )}
                <Descriptions.Item label="Loại giảm giá">
                  {selectedPromotion.discountType === "percentage" ? <PercentageOutlined /> : <DollarCircleOutlined /> }
                  {selectedPromotion.discountType === "percentage" ? " Phần trăm" : " Số tiền cố định"}
                </Descriptions.Item>
                <Descriptions.Item label="Giá trị giảm giá">
                  {selectedPromotion.discountType === "percentage"
                    ? `${selectedPromotion.discountValue}%`
                    : `${selectedPromotion.discountValue.toLocaleString()}đ`}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu"> {dayjs(selectedPromotion.startDate).format( "DD/MM/YYYY HH:mm:ss" )} </Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc"> {dayjs(selectedPromotion.endDate).format( "DD/MM/YYYY HH:mm:ss" )} </Descriptions.Item>
                <Descriptions.Item label="Trạng thái (Admin)">
                  <Tag color={selectedPromotion.isActive ? "#81C784" : "#E57373"} style={{color: '#fff'}}>
                    {selectedPromotion.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái thực tế">
                  <Tag color={getPromotionStatus(selectedPromotion).color} style={{color: '#fff'}}>
                    {getPromotionStatus(selectedPromotion).text}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ) : ( // Nội dung Form Add/Edit giữ nguyên
            <Form form={form} layout="vertical" style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid #f0f0f0" }}
                initialValues={{ isActive: true, discountType: "percentage" }} >
              <Form.Item name="name" label={<span style={{ color: "#A05A2C" }}>Tên khuyến mãi</span>} rules={[{ required: true, message: "Vui lòng nhập tên khuyến mãi!" }]} >
                <Input placeholder="Ví dụ: Giảm giá khai trương" style={{ borderRadius: 6 }} />
              </Form.Item>
              <Form.Item name="description" label={<span style={{ color: "#A05A2C" }}>Mô tả</span>} rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]} >
                <Input.TextArea rows={3} placeholder="Mô tả chi tiết về chương trình khuyến mãi" style={{ borderRadius: 6 }} />
              </Form.Item>
              <Form.Item name="code" label={ <span style={{ color: "#A05A2C" }}> Mã khuyến mãi (tùy chọn) </span> } >
                <Input placeholder="Ví dụ: SALE2025 (để trống nếu tự động áp dụng)" style={{ borderRadius: 6 }} />
              </Form.Item>
              <Space align="start" style={{ display: "flex", marginBottom: 0 }} size="large" >
                <Form.Item name="discountType" label={ <span style={{ color: "#A05A2C" }}>Loại giảm giá</span> } rules={[{ required: true }]} style={{ flex: 1 }} >
                  <Select style={{ borderRadius: 6 }}>
                    <Option value="percentage"> <PercentageOutlined /> Giảm theo phần trăm </Option>
                    <Option value="fixed_amount"> <DollarCircleOutlined /> Giảm số tiền cố định </Option>
                  </Select>
                </Form.Item>
                <Form.Item name="discountValue" label={<span style={{ color: "#A05A2C" }}>Giá trị giảm</span>} rules={[{ required: true, message: "Vui lòng nhập giá trị giảm!" }]} style={{ flex: 1 }} >
                  <InputNumber style={{ width: "100%", borderRadius: 6 }} min={0} placeholder="Nhập số (ví dụ: 20 hoặc 50000)"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value: any) => value!.replace(/[^0-9]/g, "")} />
                </Form.Item>
              </Space>
              <Form.Item name="dateRange" label={ <span style={{ color: "#A05A2C" }}>Thời gian áp dụng</span> } rules={[{ required: true, message: "Vui lòng chọn thời gian áp dụng!" }]} >
                <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%", borderRadius: 6 }} />
              </Form.Item>
              <Form.Item name="isActive" label={ <span style={{ color: "#A05A2C" }}>Trạng thái (Admin)</span> } valuePropName="checked" >
                <Select style={{ borderRadius: 6 }}>
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Không hoạt động</Option>
                </Select>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PromotionManagement;