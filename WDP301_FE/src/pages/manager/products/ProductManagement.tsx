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
  Upload,
  Descriptions,
  Image,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import axios from "axios";
import type { ColumnType } from "antd/es/table";

const { Option } = Select;

interface ProductType {
  productTypeId: number;
  name: string;
}

interface Material {
  materialId: number;
  name: string;
  quantity: number;
  storeId: number;
}

interface ProductRecipe {
  productRecipeId: number;
  productId: number;
  materialId: number;
  quantity: number;
  Material?: Material;
}

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  createAt: string;
  productTypeId: number;
  createBy: string;
  storeId: number;
  isActive: boolean;
  ProductType?: ProductType;
  ProductRecipes: ProductRecipe[];
  quantity?: number;
}

const productTypeApiOptions: ProductType[] = [
  { productTypeId: 1, name: "Món chính" },
  { productTypeId: 2, name: "Ăn kèm" },
  { productTypeId: 3, name: "Đồ uống" },
];

const typeOptionsForFilter = [
  "Tất cả",
  ...productTypeApiOptions.map(pt => pt.name),
];


const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Tất cả");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ products?: Product[], data?: Product[], results?: Product[] } | Product[]>(
        "https://wdp-301-0fd32c261026.herokuapp.com/api/products"
      );
      let productData: Product[] = [];
      if (Array.isArray(response.data)) {
        productData = response.data;
      } else if (response.data && Array.isArray(response.data.products) ) {
        productData = response.data.products;
      } else if (response.data && Array.isArray(response.data.data) ) {
        productData = response.data.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        productData = response.data.results;
      }
      const processedProducts = productData.map(p => ({
        ...p,
        ProductType: p.ProductType || { productTypeId: 0, name: "N/A" },
        ProductRecipes: p.ProductRecipes || [],
      }));
      setProducts(processedProducts);
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm! Vui lòng kiểm tra kết nối mạng và API server.");
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setEditingProduct(null);
    setSelectedProduct(null);
    setModalMode("add");
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setFileList([]);
    setModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedProduct(null);
    setModalMode("edit");
    form.setFieldsValue({
      ...product,
      productTypeId: product.ProductType?.productTypeId,
    });
    if (product.image) {
      setFileList([{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: product.image,
      }]);
    } else {
      setFileList([]);
    }
    setModalVisible(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setEditingProduct(null);
    setModalMode("view");
    setModalVisible(true);
  };

  const handleDelete = (productId: number) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        setProducts((prev) => prev.filter((p) => p.productId !== productId));
        message.success("Đã xóa sản phẩm! (Client-side)");
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let imageUrl = values.image;

      if (fileList.length > 0 && fileList[0].originFileObj) {
        imageUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsDataURL(fileList[0].originFileObj as Blob);
            reader.onload = () => resolve(reader.result as string);
        });
      } else if (fileList.length > 0 && fileList[0].url) {
        imageUrl = fileList[0].url;
      } else if (editingProduct?.image && modalMode === 'edit') {
        imageUrl = editingProduct.image;
      } else {
        imageUrl = "";
      }

      const productPayload = {
        ...values,
        image: imageUrl,
      };

      if (modalMode === "add") {
        const newProduct = {
            ...productPayload,
            productId: Date.now(),
            createAt: new Date().toISOString(),
            ProductType: productTypeApiOptions.find(pt => pt.productTypeId === values.productTypeId),
            ProductRecipes: [],
        };
        setProducts((prev) => [newProduct as Product, ...prev]);
        message.success("Đã thêm sản phẩm! (Client-side)");
      } else if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.productId === editingProduct.productId
              ? { ...p, ...productPayload, ProductType: productTypeApiOptions.find(pt => pt.productTypeId === values.productTypeId) }
              : p
          )
        );
        message.success("Đã cập nhật sản phẩm! (Client-side)");
      }
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error: any) {
      console.error("Modal OK error:", error);
      let errorMessage = "Có lỗi xảy ra!";
      if (error.errorFields) {
        errorMessage = "Vui lòng điền đầy đủ các trường bắt buộc.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      message.error(errorMessage);
    }
  };

  const onUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
        form.setFieldsValue({ image: newFileList });
    } else {
        form.setFieldsValue({ image: null });
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .filter((product) =>
        typeFilter === "Tất cả" ? true : product.ProductType?.name === typeFilter
      );
  }, [products, searchText, typeFilter]);

  const columns = [
    {
        title: <span style={{ color: "#A05A2C", fontWeight: "bold" }}>Ảnh</span>,
        dataIndex: "image",
      key: "image",
      width: 70,
      render: (img: string, record: Product) => (
        <Image
          src={img || "https://via.placeholder.com/50x50?text=N/A"}
          alt={record.name}
          width={60}
          height={60}
          style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #f0f0f0" }}
          preview={{
            mask: <EyeOutlined style={{ fontSize: 14 }} />,
          }}
          fallback="https://via.placeholder.com/40x40?text=Lỗi"
        />
      ),
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: "bold" }}>Tên</span>,
      dataIndex: "name",
      key: "name",
      width: 180,
      ellipsis: true,
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Tooltip title={name}>
            <span style={{ fontWeight: 600, color: "#D97B41" }}>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: "bold" }}>Mô tả</span>,
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
      render: (desc: string) => (
        <Tooltip title={desc}>
          <span style={{ color: "#777" }}>{desc}</span>
        </Tooltip>
      ),
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: "bold" }}>Giá</span>,
      dataIndex: "price",
      key: "price",
      width: 100,
      sorter: (a: Product, b: Product) => a.price - b.price,
      render: (price: number) => (
        <span style={{ color: "#A05A2C", fontWeight: 600 }}>
          {price?.toLocaleString()}đ
        </span>
      ),
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: "bold" }}>Loại</span>,
      dataIndex: ["ProductType", "name"],
      key: "productType",
      width: 120,
      ellipsis: true,
      sorter: (a: Product, b: Product) => (a.ProductType?.name || "").localeCompare(b.ProductType?.name || ""),
      filters: productTypeApiOptions.map(type => ({ text: type.name, value: type.name })),
      onFilter: (value: string | number | boolean, record: Product) => record.ProductType?.name === value,
      render: (_: any, record: Product) => (
        <Tooltip title={record.ProductType?.name || "Không xác định"}>
            <Tag color="#F9E4B7" style={{ color: "#A05A2C", fontWeight: 500, padding: "3px 8px", borderRadius: "6px" }}>
            {record.ProductType?.name || "Không xác định"}
            </Tag>
        </Tooltip>
      ),
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: "bold" }}>Trạng thái</span>,
      dataIndex: "isActive",
      key: "isActive",
      width: 110,
      filters: [
        { text: 'Đang bán', value: true },
        { text: 'Ngừng bán', value: false },
      ],
      onFilter: (value: string | number | boolean, record: Product) => record.isActive === value,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="#D97B41" style={{ color: "#fff", fontWeight: 500, padding: "3px 8px", borderRadius: "6px" }}>
            Đang bán
          </Tag>
        ) : (
          <Tag color="#8c8c8c" style={{ color: "#fff", fontWeight: 500, padding: "3px 8px", borderRadius: "6px" }}>
            Ngừng bán
          </Tag>
        ),
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: "bold" }}>Hành động</span>,
      key: "actions",
      align: "center" as const,
      width: 100,
      fixed: 'right',
      render: (_: any, record: Product) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#D97B41", fontSize: 17 }} />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#1890ff", fontSize: 17 }} />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined style={{ fontSize: 17 }} />}
              onClick={() => handleDelete(record.productId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9F0", padding: "20px" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ fontWeight: 700, color: "#A05A2C", fontSize: 32, marginBottom: 24, textAlign: "left" }}>
          Quản lý Sản phẩm
        </h1>
        <Card
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(160, 90, 44, 0.08)",
            padding: "12px 24px",
            border: "1px solid #F9E4B7",
            marginBottom: 24,
          }}
        >
          <div style={{ marginBottom: 20, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <Space>
            <Input
              placeholder="Tìm theo tên sản phẩm..."
              prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280, borderRadius: 6, borderColor: "#E9C97B" }}
              allowClear
            />
            <Select
              value={typeFilter}
              style={{ width: 200 }}
              onChange={(value) => setTypeFilter(value)}
            >
              {typeOptionsForFilter.map((type) => (
                <Option key={type} value={type} style={{ color: type === "Tất cả" ? "#888" : "#A05A2C" }}>
                    {type}
                </Option>
              ))}
            </Select>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: "#D97B41", borderColor: "#D97B41", fontWeight: 600, borderRadius: 6, boxShadow: "0 2px 0 rgba(0,0,0,0.043)", outline: "none" }}
              onClick={handleAdd}
            >
              Thêm sản phẩm
            </Button>
          </div>
          <Table
            columns={columns as ColumnType<Product>[]}
            dataSource={filteredProducts}
            loading={loading}
            rowKey="productId"
            pagination={{ 
                pageSize: 8, 
                showSizeChanger: true, 
                pageSizeOptions: ['8', '15', '25', '50'],
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
                style: { marginTop: 16 }
            }}
            style={{ background: "#fff", borderRadius: 8, border: "1px solid #f0f0f0" }}
            sticky
          />
        </Card>
        <Modal
          open={modalVisible}
          title={
            <span style={{ color: "#A05A2C", fontWeight: 600, fontSize: 22 }}>
              {modalMode === "view"
                ? "Chi tiết sản phẩm"
                : modalMode === "add"
                ? "Thêm sản phẩm mới"
                : "Chỉnh sửa sản phẩm"}
            </span>
          }
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setFileList([]);
          }}
          footer={
            modalMode === "view"
              ? [
                  <Button key="close" onClick={() => setModalVisible(false)} style={{ borderRadius: 6}}>
                    Đóng
                  </Button>,
                ]
              : [
                  <Button key="cancel" onClick={() => {
                      setModalVisible(false);
                      form.resetFields();
                      setFileList([]);
                    }}
                    style={{ borderRadius: 6}}
                    >
                    Hủy
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={handleModalOk}
                    style={{ background: "#D97B41", borderColor: "#D97B41", borderRadius: 6 }}
                    loading={loading && (modalMode === 'add' || modalMode === 'edit')}
                  >
                    {modalMode === "add" ? "Thêm mới" : "Cập nhật"}
                  </Button>,
                ]
          }
          width={modalMode === 'view' ? 700 : 600}
          // Đã sửa lỗi destroyOnClose ở đây
          destroyOnHidden
          styles={{
            body: { background: "#FFF9F0", borderRadius: "0 0 12px 12px", padding: "24px" },
          }}
          style={{ borderRadius: 12, top: 20 }}
        >
          {/* Nội dung Modal không thay đổi */}
          {modalMode === 'view' && selectedProduct ? (
            <Card
              bordered={false}
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 0,
              }}
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{ color: "#A05A2C", fontWeight: 500, width: '150px' }}
                contentStyle={{ color: "#555" }}
              >
                <Descriptions.Item label="Ảnh" span={selectedProduct.description && selectedProduct.description.length > 100 ? 2 : 1}>
                  <Image
                    src={selectedProduct.image || "https://via.placeholder.com/120x120?text=No+Image"}
                    width={120}
                    height={120}
                    style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Tên sản phẩm" >{selectedProduct.name}</Descriptions.Item>
                {selectedProduct.description && selectedProduct.description.length <= 100 && (
                     <Descriptions.Item label="Mô tả" span={1}>{selectedProduct.description}</Descriptions.Item>
                )}
                <Descriptions.Item label="Giá">{selectedProduct.price?.toLocaleString()}đ</Descriptions.Item>
                <Descriptions.Item label="Loại">{selectedProduct.ProductType?.name || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {selectedProduct.isActive ? (
                    <Tag color="#D97B41" style={{ color: "#fff", borderRadius: 6 }}>Đang bán</Tag>
                  ) : (
                    <Tag color="#8c8c8c" style={{ color: "#fff", borderRadius: 6 }}>Ngừng bán</Tag>
                  )}
                </Descriptions.Item>
                 {selectedProduct.quantity !== undefined && <Descriptions.Item label="Số lượng tồn">{selectedProduct.quantity}</Descriptions.Item>}
              </Descriptions>
              {selectedProduct.description && selectedProduct.description.length > 100 && (
                  <Descriptions layout="vertical" bordered style={{marginTop: 16}} labelStyle={{ color: "#A05A2C", fontWeight: 500}} contentStyle={{ color: "#555" }}>
                      <Descriptions.Item label="Mô tả chi tiết">{selectedProduct.description}</Descriptions.Item>
                  </Descriptions>
              )}

              {selectedProduct.ProductRecipes && selectedProduct.ProductRecipes.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <h4 style={{ color: "#A05A2C", fontWeight: 600, marginBottom: 10 }}>Công thức (Recipe):</h4>
                    <Table
                    dataSource={selectedProduct.ProductRecipes.map((r) => ({
                        ...r,
                        materialName: r.Material?.name || "Không rõ",
                    }))}
                    columns={[
                        { title: "Nguyên liệu", dataIndex: "materialName", key: "materialName", render: (text) => <span style={{color: "#666"}}>{text}</span> },
                        { title: "Số lượng", dataIndex: "quantity", key: "quantity", render: (text) => <span style={{color: "#666"}}>{text}</span> },
                    ]}
                    pagination={false}
                    rowKey="productRecipeId"
                    size="small"
                    style={{ background: "#FFF9F0", borderRadius: 8, border: "1px solid #f0f0f0" }}
                    />
                </div>
              )}
            </Card>
          ) : (
            <Form
              form={form}
              layout="vertical"
              style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid #f0f0f0"}}
              initialValues={{ isActive: true }}
            >
              <Form.Item
                name="image"
                label={<span style={{ color: "#A05A2C" }}>Ảnh sản phẩm</span>}
                rules={[{ required: modalMode === 'add', message: "Vui lòng tải lên ảnh sản phẩm!" }]}
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                        return e;
                    }
                    return e && e.fileList;
                }}
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={onUploadChange}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  {fileList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Form.Item
                name="name"
                label={<span style={{ color: "#A05A2C" }}>Tên sản phẩm</span>}
                rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
              >
                <Input placeholder="Ví dụ: Cơm tấm sườn bì chả" style={{borderRadius: 6}} />
              </Form.Item>
              <Form.Item
                name="description"
                label={<span style={{ color: "#A05A2C" }}>Mô tả</span>}
                rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
              >
                <Input.TextArea rows={3} placeholder="Mô tả chi tiết về sản phẩm" style={{borderRadius: 6}}/>
              </Form.Item>
              <Space align="start" style={{display: 'flex', marginBottom: 0}} size="large">
                <Form.Item
                    name="price"
                    label={<span style={{ color: "#A05A2C" }}>Giá</span>}
                    rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                    style={{ flex: 1 }}
                >
                    <InputNumber
                    style={{ width: "100%", borderRadius: 6 }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value: any) => value!.replace(/\$\s?|(,*)/g, "")}
                    placeholder="Ví dụ: 35000"
                    min={0}
                    />
                </Form.Item>
                <Form.Item
                    name="quantity"
                    label={<span style={{ color: "#A05A2C" }}>Số lượng tồn kho</span>}
                    rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
                    style={{ flex: 1 }}
                >
                    <InputNumber
                    style={{ width: "100%", borderRadius: 6 }}
                    placeholder="Ví dụ: 100"
                    min={0}
                    />
                </Form.Item>
              </Space>
              <Space align="start" style={{display: 'flex', marginBottom: 0}} size="large">
                <Form.Item
                    name="productTypeId"
                    label={<span style={{ color: "#A05A2C" }}>Loại sản phẩm</span>}
                    rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm!" }]}
                    style={{ flex: 1 }}
                >
                    <Select placeholder="Chọn loại sản phẩm" style={{borderRadius: 6}}>
                    {productTypeApiOptions.map((type) => (
                        <Option key={type.productTypeId} value={type.productTypeId}>
                        {type.name}
                        </Option>
                    ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="isActive"
                    label={<span style={{ color: "#A05A2C" }}>Trạng thái</span>}
                    initialValue={true}
                    style={{ flex: 1 }}
                >
                    <Select style={{borderRadius: 6}}>
                    <Option value={true}>Đang bán</Option>
                    <Option value={false}>Ngừng bán</Option>
                    </Select>
                </Form.Item>
              </Space>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ProductManagement;