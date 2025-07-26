import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Popconfirm,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  TagOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";
import PromotionTypeManagement from "./PromotionTypeManagement";
import axios from "axios";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const { Option } = Select;
const { RangePicker } = DatePicker;

interface ApiPromotion {
  promotionId: number;
  promotionTypeId: number;
  name: string;
  description: string;
  code: string | null;
  startDate: string;
  endDate: string;
  minOrderAmount: number;
  discountAmount: number;
  NumberCurrentUses: number;
  maxNumberOfUses: number;
  isActive: boolean;
  createBy: number;
  createdAt: string;
  updatedAt: string;
}

interface Promotion {
  promotionId: number;
  name: string;
  description: string;
  code?: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  promotionTypeId: number;
  maxNumberOfUses: number;
}

interface PromotionFormValues {
  name: string;
  code: string;
  promotionTypeId: number;
  description: string;
  dateRange: [Dayjs, Dayjs];
  minOrderAmount: number;
  discountAmount: number;
  maxNumberOfUses: number;
}

const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [typeFilter, setTypeFilter] = useState<string>("Tất cả");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [promotionTypes, setPromotionTypes] = useState<any[]>([]);

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập để xem khuyến mãi.");
        return;
      }
      const response = await axios.get<ApiPromotion[]>(
        `${import.meta.env.VITE_API_URL}promotions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mappedPromotions: Promotion[] = response.data.map((p) => {
        const type = promotionTypes.find(
          (t) => t.promotionTypeId === p.promotionTypeId
        );
        return {
          promotionId: p.promotionId,
          name: p.name,
          description: p.description,
          code: p.code || undefined,
          startDate: p.startDate,
          endDate: p.endDate,
          maxNumberOfUses: p.maxNumberOfUses,
          isActive: p.isActive,
          discountValue: p.discountAmount,
          discountType: type ? type.name : "",
          promotionTypeId: p.promotionTypeId,
        };
      });
      setPromotions(mappedPromotions);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      message.error("Không thể tải danh sách khuyến mãi.");
    } finally {
      setIsLoading(false);
    }
  }, [promotionTypes]);
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}promotion-types`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setPromotionTypes(res.data))
      .catch(() => setPromotionTypes([]));
  }, []);

  const handleDelete = async (promotionId: number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}promotions/${promotionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Đã ngừng hoạt động khuyến mãi thành công!");
      fetchPromotions();
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      message.error("Có lỗi xảy ra khi ngừng hoạt động khuyến mãi.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPromotionStatus = (
    promotion: Promotion
  ): { text: string; color: string } => {
    const now = dayjs();
    const startDate = dayjs(promotion.startDate);
    const endDate = dayjs(promotion.endDate);
    if (!promotion.isActive)
      return { text: "Không hoạt động", color: "#B0A8A8" };
    if (now.isAfter(endDate)) return { text: "Đã kết thúc", color: "#E57373" };
    if (now.isBefore(startDate))
      return { text: "Sắp diễn ra", color: "#64B5F6" };
    return { text: "Đang diễn ra", color: "#81C784" };
  };

  const handleAdd = () => {
    setEditingPromotion(null);
    setModalMode("add");
    form.resetFields();
    form.setFieldsValue({ isActive: true, discountType: "percentage" });
    setModalVisible(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setModalMode("edit");
    form.setFieldsValue({
      ...promotion,
      discountAmount: promotion.discountValue,
      dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)],
    });
    setModalVisible(true);
  };

  const handleView = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setModalMode("view");
    setModalVisible(true);
  };

  const handleFormSubmit = async (values: PromotionFormValues) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const [startDate, endDate] = values.dateRange;

    const payload = {
      name: values.name,
      code: values.code,
      promotionTypeId: values.promotionTypeId,
      description: values.description,
      startDate: startDate.format("YYYY-MM-DDTHH:mm:ss"),
      endDate: endDate.format("YYYY-MM-DDTHH:mm:ss"),
      minOrderAmount: values.minOrderAmount || 0,
      discountAmount: values.discountAmount,
      maxNumberOfUses: values.maxNumberOfUses || 0,
    };

    try {
      if (modalMode === "edit" && editingPromotion) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}promotions/${editingPromotion.promotionId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Cập nhật khuyến mãi thành công!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}promotions`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Tạo khuyến mãi thành công!");
      }
      setModalVisible(false);
      form.resetFields();
      fetchPromotions();
    } catch (err) {
      console.error("Failed to submit form:", err);
      message.error(
        modalMode === "edit"
          ? "Cập nhật khuyến mãi thất bại!"
          : "Tạo khuyến mãi thất bại!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPromotions = useMemo(() => {
    return promotions.filter(
      (promo) =>
        (promo.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (promo.code &&
            promo.code.toLowerCase().includes(searchText.toLowerCase()))) &&
        (statusFilter === "Tất cả" ||
          getPromotionStatus(promo).text === statusFilter) &&
        (typeFilter === "Tất cả" || promo.discountType === typeFilter)
    );
  }, [promotions, searchText, statusFilter, typeFilter]);

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";

  const columns = [
    {
      title: "Tên khuyến mãi",
      dataIndex: "name",
      key: "name",
      width: 180,
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
      width: 130,
      ellipsis: true,
      render: (code?: string) =>
        code ? (
          <Tag color="#A05A2C" style={{ color: "#fff", fontWeight: 500 }}>
            {code}
          </Tag>
        ) : (
          <span style={{ color: "#aaa" }}>Không có</span>
        ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountValue",
      key: "discount",
      width: 110,
      align: "right" as const,
      sorter: (a: Promotion, b: Promotion) => a.discountValue - b.discountValue,
      render: (_value: number, record: Promotion) => (
        <span style={{ color: "#A05A2C", fontWeight: 500 }}>
          {record.discountValue.toLocaleString()}đ
        </span>
      ),
    },
    {
      title: "Thời gian",
      key: "duration",
      width: 200,
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
      render: (_: any, record: Promotion) => {
        const status = getPromotionStatus(record);
        return (
          <Tag
            color={status.color}
            style={{
              fontWeight: 500,
              padding: "3px 8px",
              borderRadius: "6px",
              color: "#fff",
            }}
          >
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: "Loại KM",
      dataIndex: "discountType",
      key: "discountType",
      width: 120,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center" as const,
      width: 130,
      fixed: "right" as const,
      render: (_: any, record: Promotion) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              style={{ outline: "none", boxShadow: "none", border: "none" }}
              type="text"
              icon={<EyeOutlined style={{ color: "#D97B41", fontSize: 17 }} />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              style={{ outline: "none", boxShadow: "none", border: "none" }}
              type="text"
              icon={<EditOutlined style={{ color: "#A05A2C", fontSize: 17 }} />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Ngừng hoạt động">
            <Popconfirm
              title="Ngừng khuyến mãi"
              description="Bạn có chắc muốn ngừng hoạt động khuyến mãi này?"
              onConfirm={() => handleDelete(record.promotionId)}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
                style: { background: "#D97B41", borderColor: "#D97B41" },
              }}
            >
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined style={{ fontSize: 16 }} />}
                style={{ outline: "none", boxShadow: "none", border: "none" }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF9F0",
        padding: "20px 30px 30px 60px",
      }}
    >
      <style>{`
        /* Your CSS styles remain the same */
        .ant-table-thead > tr > th { background-color: ${headerBgColor} !important; color: ${headerColor} !important; font-weight: bold !important; border-right: 1px solid ${borderColor} !important; border-bottom: 2px solid ${tableBorderColor} !important; }
        .ant-table-thead > tr > th.ant-table-cell-fix-right:last-child { border-right: none !important; }
        .promo-table .ant-table-tbody > tr.even-row-promo > td { background-color: ${evenRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .promo-table .ant-table-tbody > tr.odd-row-promo > td { background-color: ${oddRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .promo-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) { border-right: none; }
        .promo-table .ant-table-tbody > tr:hover > td { background-color: #FDEBC8 !important; }
        .promo-table .ant-table-cell-fix-right { background: inherit !important; }
        .promo-table .ant-table-thead > tr > th.ant-table-cell-fix-right { background-color: ${headerBgColor} !important; }
        .ant-input-number:focus, .ant-input-number-focused, .ant-input-number:hover,
        .ant-select-focused .ant-select-selector, .ant-select-selector:focus, .ant-select-selector:hover,
        .ant-picker:focus, .ant-picker:hover, .ant-input:focus, .ant-input:hover,
        .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus-within {
          border-color: #D97B41 !important; box-shadow: none !important;
        }
        .ant-pagination .ant-pagination-item-active, .ant-pagination .ant-pagination-item-active a { border-color: #D97B41 !important; color: #D97B41 !important; }
        .ant-select-selector { border-color: #E9C97B !important; }
        .ant-select-selector:hover { border-color: #D97B41 !important; }
        .ant-table-column-sorter-up.active svg,
        .ant-table-column-sorter-down.active svg {
          color: #D97B41 !important;
          fill: #D97B41 !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1
          style={{
            fontWeight: 700,
            color: "#A05A2C",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
            paddingTop: 0,  
            marginTop: 0,
          }}
        >
          Quản lý Khuyến mãi <TagOutlined />
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
                style={{
                  width: 280,
                  borderRadius: 6,
                  borderColor: "#E9C97B",
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "none",
                }}
                allowClear
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 160 }}
                options={[
                  { value: "Tất cả", label: "Tất cả trạng thái" },
                  { value: "Đang diễn ra", label: "Đang diễn ra" },
                  { value: "Sắp diễn ra", label: "Sắp diễn ra" },
                  { value: "Đã kết thúc", label: "Đã kết thúc" },
                  { value: "Không hoạt động", label: "Không hoạt động" },
                ]}
              />
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 160 }}
                options={[
                  { value: "Tất cả", label: "Tất cả loại KM" },
                  ...promotionTypes.map((type) => ({
                    value: type.name,
                    label: type.name,
                  })),
                ]}
              />
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
                outline: "none",
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
            loading={isLoading}
            rowKey="promotionId"
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "even-row-promo" : "odd-row-promo"
            }
            sticky
          />
        </Card>
        <PromotionTypeManagement />
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
                    style={{ borderRadius: 6, outline: "none" }}
                    disabled={isLoading}
                  >
                    Hủy
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    form="promotion-form"
                    htmlType="submit"
                    style={{
                      background: "#D97B41",
                      borderColor: "#D97B41",
                      borderRadius: 6,
                      outline: "none",
                    }}
                  >
                    {modalMode === "add" ? "Thêm mới" : "Cập nhật"}
                  </Button>,
                ]
          }
          width={modalMode === "view" ? 700 : 650}
          destroyOnClose
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
                labelStyle={{
                  color: "#A05A2C",
                  fontWeight: 500,
                  width: "180px",
                  background: "#FFF9F0",
                }}
                contentStyle={{ color: "#555", background: "#FFFFFF" }}
              >
                <Descriptions.Item label="Tên khuyến mãi">
                  {selectedPromotion.name}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  {selectedPromotion.description}
                </Descriptions.Item>
                {selectedPromotion.code && (
                  <Descriptions.Item label="Mã khuyến mãi">
                    {selectedPromotion.code}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Giá trị giảm giá">
                  {selectedPromotion.discountValue.toLocaleString()}đ
                </Descriptions.Item>
                <Descriptions.Item label="Số lượt sử dụng tối đa">
                  {selectedPromotion.maxNumberOfUses}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu">
                  {dayjs(selectedPromotion.startDate).format(
                    "DD/MM/YYYY HH:mm:ss"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc">
                  {dayjs(selectedPromotion.endDate).format(
                    "DD/MM/YYYY HH:mm:ss"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái (Admin)">
                  <Tag
                    color={selectedPromotion.isActive ? "#81C784" : "#E57373"}
                    style={{ color: "#fff" }}
                  >
                    {selectedPromotion.isActive
                      ? "Đang hoạt động"
                      : "Không hoạt động"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái thực tế">
                  <Tag
                    color={getPromotionStatus(selectedPromotion).color}
                    style={{ color: "#fff" }}
                  >
                    {getPromotionStatus(selectedPromotion).text}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ) : (
            <Form
              id="promotion-form"
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              style={{
                background: "#fff",
                padding: "24px",
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
              }}
              initialValues={{ isActive: true, discountType: "percentage" }}
            >
              <Form.Item
                style={{ marginBottom: 0 }}
                name="name"
                label={<span style={{ color: "#A05A2C" }}>Tên khuyến mãi</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập tên khuyến mãi!" },
                ]}
              >
                <Input
                  placeholder="Ví dụ: Giảm giá khai trương"
                  style={{ borderRadius: 6, marginBottom: 16 }}
                />
              </Form.Item>
              <Form.Item
                style={{ marginBottom: 0 }}
                name="description"
                label={<span style={{ color: "#A05A2C" }}>Mô tả</span>}
                rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Mô tả chi tiết về chương trình khuyến mãi"
                  style={{ borderRadius: 6, marginBottom: 16 }}
                />
              </Form.Item>
              <Form.Item
                style={{ marginBottom: 0 }}
                name="code"
                label={<span style={{ color: "#A05A2C" }}>Mã khuyến mãi</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập mã khuyến mãi!" },
                  {
                    max: 10,
                    message: "Mã khuyến mãi không được vượt quá 10 ký tự!",
                  },
                ]}
              >
                <Input
                  placeholder="Ví dụ: SALE2025"
                  style={{ borderRadius: 6, marginBottom: 16 }}
                />
              </Form.Item>
              <Form.Item
                style={{ marginBottom: 0 }}
                name="promotionTypeId"
                label={
                  <span style={{ color: "#A05A2C" }}>Loại khuyến mãi</span>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn loại khuyến mãi!" },
                ]}
              >
                <Select
                  placeholder="Chọn loại khuyến mãi"
                  style={{ borderRadius: 6, marginBottom: 16 }}
                >
                  {promotionTypes.map((type: any) => (
                    <Option
                      key={type.promotionTypeId}
                      value={type.promotionTypeId}
                    >
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                style={{ marginBottom: 0 }}
                name="isActive"
                label={<span style={{ color: "#A05A2C" }}>Trạng thái</span>}
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select
                  placeholder="Chọn trạng thái"
                  style={{ borderRadius: 6, marginBottom: 16 }}
                >
                  <Option value={true}>Đang hoạt động</Option>
                  <Option value={false}>Không hoạt động</Option>
                </Select>
              </Form.Item>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name="discountAmount"
                    label={
                      <span style={{ color: "#A05A2C" }}>Giá trị giảm</span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giá trị giảm!",
                      },
                      { type: "number", message: "Giá trị giảm phải là số!" },
                    ]}
                  >
                    <InputNumber
                      style={{
                        width: "100%",
                        borderRadius: 6,
                        marginBottom: 16,
                      }}
                      min={1000}
                      placeholder="Nhập số lớn hơn 1000"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value: any) => value!.replace(/[^0-9]/g, "")}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name="maxNumberOfUses"
                    label={
                      <span style={{ color: "#A05A2C" }}>
                        Số lượt sử dụng tối đa
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số lượt sử dụng!",
                      },
                      { type: "number", message: "Vui lòng nhập số!" },
                    ]}
                  >
                    <InputNumber
                      style={{
                        width: "100%",
                        borderRadius: 6,
                        marginBottom: 16,
                      }}
                      min={0}
                      placeholder="Nhập số lượt tối đa"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name="minOrderAmount"
                    label={
                      <span style={{ color: "#A05A2C" }}>
                        Giá trị đơn hàng tối thiểu
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giá trị đơn hàng tối thiểu!",
                      },
                      { type: "number", message: "Vui lòng nhập số!" },
                    ]}
                  >
                    <InputNumber
                      style={{
                        width: "100%",
                        borderRadius: 6,
                        marginBottom: 16,
                      }}
                      min={0}
                      placeholder="Nhập giá trị tối thiểu (VND)"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value: any) => value!.replace(/[^0-9]/g, "")}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                style={{ marginBottom: 0 }}
                name="dateRange"
                label="Thời gian áp dụng"
                rules={[
                  { required: true, message: "Chọn thời gian!" },
                  {
                    validator: (_, value) => {
                      if (!value || value.length !== 2)
                        return Promise.resolve();
                      const now = dayjs();
                      if (value[0].isAfter(now) && value[1].isAfter(value[0])) {
                        return Promise.resolve();
                      }
                      if (!value[0].isAfter(now)) {
                        return Promise.reject(
                          new Error("Ngày bắt đầu phải sau thời điểm hiện tại!")
                        );
                      }
                      return Promise.reject(
                        new Error("Ngày kết thúc phải sau ngày bắt đầu!")
                      );
                    },
                  },
                ]}
              >
                <RangePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%", marginBottom: 16 }}
                />
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PromotionManagement;
