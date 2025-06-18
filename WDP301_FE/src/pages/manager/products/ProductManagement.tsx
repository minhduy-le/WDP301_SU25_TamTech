import React, { useEffect, useState } from "react";
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
  MinusCircleOutlined,
  ProductOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase";
import type { ColumnType } from "antd/es/table";
import { useProductTypes } from "../../../hooks/productTypesApi";
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

const uploadImageAndGetUrl = async (file: File) => {
  const storageRef = ref(
    storage,
    `products/${Date.now()}_${file.name}?alt=media`
  );
  await uploadBytes(storageRef, file);
  console.log(storageRef);
  return getDownloadURL(storageRef);
};

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");
  const [form] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const { data: productTypes, isLoading: isProductTypesLoading } =
    useProductTypes();
  const [filterType, setFilterType] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchProducts = async (page = 1, typeId?: number) => {
    setTableLoading(true);
    try {
      let response;
      if (typeId) {
        response = await axios.get(`https://wdp301-su25.space/api/products/type/${typeId}`);
      } else {
        response = await axios.get(`https://wdp301-su25.space/api/products?page=${page}`);
      }
      let productData: Product[] = [];
      let totalPagesFromApi = 1;
      if (Array.isArray(response.data)) {
        productData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.products)) {
          productData = response.data.products;
        } else if (Array.isArray(response.data.data)) {
          productData = response.data.data;
        } else if (Array.isArray(response.data.results)) {
          productData = response.data.results;
        }
        if (typeof response.data.totalPages === 'number') {
          totalPagesFromApi = response.data.totalPages;
        }
      }
      const processedProducts = productData.map((p) => ({
        ...p,
        ProductType: p.ProductType || { productTypeId: 0, name: "N/A" },
        ProductRecipes: p.ProductRecipes || [],
      }));
      setProducts(processedProducts);
      setTotalPages(totalPagesFromApi);
      console.log("số lượng sản phẩm", processedProducts.length);
    } catch (error) {
      message.error(
        "Không thể tải danh sách sản phẩm! Vui lòng kiểm tra kết nối mạng và API server."
      );
      console.error("Fetch products error:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<
        | { data?: Material[]; materials?: Material[]; results?: Material[] }
        | Material[]
      >("https://wdp301-su25.space/api/materials", {
        headers: {
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      let materialData: Material[] = [];
      if (Array.isArray(response.data)) {
        materialData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        materialData = response.data.data;
      } else if (response.data && Array.isArray(response.data.materials)) {
        materialData = response.data.materials;
      } else if (response.data && Array.isArray(response.data.results)) {
        materialData = response.data.results;
      }
      setMaterials(materialData);
    } catch (error) {
      console.error("Fetch materials error:", error);
      message.error("Không thể tải nguyên liệu!");
    }
  };

  const createProductApiCall = async (payload: any) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "https://wdp301-su25.space/api/products",
      payload,
      {
        headers: {
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  };

  const updateProductApiCall = async (productId: number, payload: any) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `https://wdp301-su25.space/api/products/${productId}`,
      payload,
      {
        headers: {
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  };

  const deleteProductApiCall = async (productId: number) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `https://wdp301-su25.space/api/products/${productId}`,
      {
        headers: {
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  };

  useEffect(() => {
    fetchProducts();
    fetchMaterials();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, filterType);
  }, [filterType]);

  const handleAdd = () => {
    setEditingProduct(null);
    setSelectedProduct(null);
    setModalMode("add");
    form.resetFields();
    form.setFieldsValue({ isActive: true, recipes: [] });
    setFileList([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedProduct(null);
    setModalMode("edit");
    form.setFieldsValue({
      ...product,
      productTypeId: product.ProductType?.productTypeId,
      recipes: product.ProductRecipes.map((r) => ({
        materialId: r.materialId,
        quantity: r.quantity,
      })),
    });
    if (product.image) {
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: product.image,
        },
      ]);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(product.image);
    } else {
      setFileList([]);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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
        try {
          await deleteProductApiCall(productId);
          message.success("Đã xóa sản phẩm!");
          await fetchProducts();
        } catch (error) {
          console.error("Delete product error:", error);
          message.error("Xóa sản phẩm thất bại!");
        }
      },
    });
  };

  const handleModalOk = async () => {
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      let imageUrl = editingProduct?.image || "";

      if (
        Array.isArray(values.image) &&
        values.image.length > 0 &&
        values.image[0].originFileObj
      ) {
        imageUrl = await uploadImageAndGetUrl(
          values.image[0].originFileObj as File
        );
      } else if (
        Array.isArray(values.image) &&
        values.image.length > 0 &&
        values.image[0].url
      ) {
        imageUrl = values.image[0].url;
      } else if (typeof values.image === "string") {
        imageUrl = values.image;
      }

      const productPayload = {
        ...values,
        price: Number(values.price),
        image: imageUrl,
        recipes: Array.isArray(values.recipes)
          ? values.recipes.map((r: any) => ({
              materialId: r.materialId,
              quantity: r.quantity,
            }))
          : [],
      };

      if (modalMode === "add") {
        await createProductApiCall(productPayload);
        message.success("Đã thêm sản phẩm!");
      } else if (editingProduct) {
        await updateProductApiCall(editingProduct.productId, productPayload);
        message.success("Đã cập nhật sản phẩm!");
      }

      await fetchProducts();
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error("Modal OK error:", error);
      let errorMessage = "Có lỗi xảy ra!";
      if (error.errorFields) {
        errorMessage = "Vui lòng điền đầy đủ các trường bắt buộc.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      form.setFieldsValue({ image: newFileList });
      const file = newFileList[0];
      if (file.originFileObj) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const preview = URL.createObjectURL(file.originFileObj as File);
        setPreviewUrl(preview);
      } else if (file.url) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(file.url);
      }
    } else {
      form.setFieldsValue({ image: null });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };
  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";

  const columns: ColumnType<Product>[] = [
    {
      title: "ID",
      dataIndex: "productId",
      key: "productId",
      sorter: (a: Product, b: Product) => a.productId - b.productId,
      width: 70,
      render: (id: number) => `${id}`,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 85,
      render: (img: string, record: Product) => (
        <Image
          src={img || "https://via.placeholder.com/60x60?text=N/A"}
          alt={record.name}
          width={60}
          height={60}
          style={{
            objectFit: "cover",
            borderRadius: 6,
            border: "1px solid #f0f0f0",
          }}
          preview={{ mask: <EyeOutlined style={{ fontSize: 14 }} /> }}
          fallback="https://via.placeholder.com/60x60?text=Lỗi"
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Tooltip title={name}>
          <span style={{ fontWeight: 600, color: "#D97B41" }}>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 220,
      ellipsis: true,
      render: (desc: string) => (
        <Tooltip title={desc}>
          <span>{desc}</span>
        </Tooltip>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 120, // Tăng width
      align: "right" as const,
      sorter: (a: Product, b: Product) => a.price - b.price,
      render: (price: number) => (
        <span style={{ color: "#A05A2C", fontWeight: 600 }}>
          {price?.toLocaleString()}đ
        </span>
      ),
    },
    {
      title: "Loại",
      dataIndex: ["ProductType", "name"],
      key: "productType",
      width: 130,
      ellipsis: true,
      render: (_: any, record: Product) => (
        <Tooltip title={record.ProductType?.name || "Không xác định"}>
          <Tag
            color="#F9E4B7"
            style={{
              color: "#A05A2C",
              fontWeight: 500,
              padding: "3px 8px",
              borderRadius: "6px",
            }}
          >
            {record.ProductType?.name || "Không xác định"}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      align: "center" as const,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag
            color="#D97B41"
            style={{
              color: "#fff",
              fontWeight: 500,
              padding: "3px 8px",
              borderRadius: "6px",
            }}
          >
            Đang bán
          </Tag>
        ) : (
          <Tag
            color="#8c8c8c"
            style={{
              color: "#fff",
              fontWeight: 500,
              padding: "3px 8px",
              borderRadius: "6px",
            }}
          >
            Ngừng bán
          </Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center" as const,
      width: 135,
      fixed: "right",
      render: (_: any, record: Product) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              style={{ outline: "none", boxShadow: "none", border: "none" }}
              icon={<EyeOutlined style={{ color: "#D97B41", fontSize: 17 }} />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#A05A2C", fontSize: 17 }} />}
              onClick={() => handleEdit(record)}
              style={{ outline: "none", boxShadow: "none", border: "none" }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined style={{ fontSize: 17 }} />}
              onClick={() => handleDelete(record.productId)}
              style={{ outline: "none", boxShadow: "none", border: "none" }}
            />
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
          Quản lý Sản phẩm <ProductOutlined />
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
                placeholder="Tìm theo tên sản phẩm..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 220,
                  borderRadius: 6,
                  borderColor: "#E9C97B",
                  height: 31,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                allowClear
              />
              <Select
                allowClear
                placeholder="Loại đồ ăn"
                style={{ width: 140, borderRadius: 6 }}
                value={filterType}
                onChange={(v) => setFilterType(v)}
                loading={isProductTypesLoading}
              >
                {isProductTypesLoading ? (
                  <Option value="" disabled>Đang tải...</Option>
                ) : (
                  productTypes?.map((type) => (
                    <Option key={type.productTypeId} value={type.productTypeId}>
                      {type.name}
                    </Option>
                  ))
                )}
              </Select>
              <Select
                allowClear
                placeholder="Trạng thái"
                style={{ width: 120, borderRadius: 6 }}
                value={filterStatus}
                onChange={(v) => setFilterStatus(v)}
              >
                <Option value={true}>Đang bán</Option>
                <Option value={false}>Ngừng bán</Option>
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
                outline: "none",
              }}
              onClick={handleAdd}
            >
              Thêm sản phẩm
            </Button>
          </div>
          <Table
            className="product-table"
            columns={columns}
            dataSource={products.filter((product) => {
              const matchName = product.name
                .toLowerCase()
                .includes(searchText.toLowerCase());
              const matchType = filterType
                ? product.ProductType?.productTypeId === filterType
                : true;
              const matchStatus =
                filterStatus !== undefined
                  ? product.isActive === filterStatus
                  : true;
              return matchName && matchType && matchStatus;
            })}
            loading={tableLoading}
            rowKey="productId"
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "even-row-product" : "odd-row-product"
            }
            sticky
            pagination={{
              current: page,
              pageSize,
              total: totalPages * pageSize,
              onChange: (p) => setPage(p),
            }}
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
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }}
          footer={
            modalMode === "view"
              ? [
                  <Button
                    key="close"
                    onClick={() => setModalVisible(false)}
                    style={{ borderRadius: 6 }}
                  >
                    {" "}
                    Đóng{" "}
                  </Button>,
                ]
              : [
                  <Button
                    key="cancel"
                    onClick={() => {
                      setModalVisible(false);
                      form.resetFields();
                      setFileList([]);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
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
                    style={{
                      background: "#D97B41",
                      borderColor: "#D97B41",
                      borderRadius: 6,
                    }}
                    loading={isSubmitting}
                  >
                    {modalMode === "add" ? "Thêm mới" : "Cập nhật"}
                  </Button>,
                ]
          }
          width={modalMode === "view" ? 700 : 600}
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
          {modalMode === "view" && selectedProduct ? (
            <Card
              bordered={false}
              style={{ background: "#fff", borderRadius: 8, padding: 0 }}
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{
                  color: "#A05A2C",
                  fontWeight: 500,
                  width: "150px",
                  background: "#FFF9F0",
                }}
                contentStyle={{ color: "#555", background: "#FFFFFF" }}
              >
                <Descriptions.Item label="ID">
                  {selectedProduct.productId}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Ảnh"
                  span={
                    selectedProduct.description &&
                    selectedProduct.description.length > 100
                      ? 2
                      : 1
                  }
                >
                  <Image
                    src={
                      selectedProduct.image ||
                      "https://via.placeholder.com/120x120?text=No+Image"
                    }
                    width={120}
                    height={120}
                    style={{
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #eee",
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Tên sản phẩm">
                  {selectedProduct.name}
                </Descriptions.Item>
                {selectedProduct.description &&
                  selectedProduct.description.length <= 100 && (
                    <Descriptions.Item label="Mô tả" span={1}>
                      {selectedProduct.description}
                    </Descriptions.Item>
                  )}
                <Descriptions.Item label="Giá">
                  {selectedProduct.price?.toLocaleString()}đ
                </Descriptions.Item>
                <Descriptions.Item label="Loại">
                  {selectedProduct.ProductType?.name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {selectedProduct.isActive ? (
                    <Tag
                      color="#D97B41"
                      style={{ color: "#fff", borderRadius: 6 }}
                    >
                      Đang bán
                    </Tag>
                  ) : (
                    <Tag
                      color="#8c8c8c"
                      style={{ color: "#fff", borderRadius: 6 }}
                    >
                      Ngừng bán
                    </Tag>
                  )}
                </Descriptions.Item>
                {selectedProduct.quantity !== undefined && (
                  <Descriptions.Item label="Số lượng tồn">
                    {selectedProduct.quantity}
                  </Descriptions.Item>
                )}
              </Descriptions>
              {selectedProduct.description &&
                selectedProduct.description.length > 100 && (
                  <Descriptions
                    layout="vertical"
                    bordered
                    style={{ marginTop: 16 }}
                    labelStyle={{
                      color: "#A05A2C",
                      fontWeight: 500,
                      background: "#FFF9F0",
                    }}
                    contentStyle={{ color: "#555", background: "#FFFFFF" }}
                  >
                    <Descriptions.Item label="Mô tả chi tiết">
                      {selectedProduct.description}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              {selectedProduct.ProductRecipes &&
                selectedProduct.ProductRecipes.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h4
                      style={{
                        color: "#A05A2C",
                        fontWeight: 600,
                        marginBottom: 10,
                      }}
                    >
                      Công thức (Recipe):
                    </h4>
                    <Table
                      dataSource={selectedProduct.ProductRecipes.map((r) => ({
                        ...r,
                        materialName: r.Material?.name || "Không rõ",
                      }))}
                      columns={[
                        {
                          title: "Nguyên liệu",
                          dataIndex: "materialName",
                          key: "materialName",
                          render: (text) => (
                            <span style={{ color: cellTextColor }}>{text}</span>
                          ),
                        },
                        {
                          title: "Số lượng",
                          dataIndex: "quantity",
                          key: "quantity",
                          render: (text) => (
                            <span style={{ color: cellTextColor }}>{text}</span>
                          ),
                        },
                      ]}
                      pagination={false}
                      rowKey="productRecipeId"
                      size="small"
                      style={{
                        background: evenRowBgColor,
                        borderRadius: 8,
                        border: `1px solid ${borderColor}`,
                      }}
                    />
                  </div>
                )}
            </Card>
          ) : (
            <Form
              form={form}
              layout="vertical"
              style={{
                background: "#fff",
                padding: "24px",
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
              }}
              initialValues={{ isActive: true }}
            >
              <Form.Item
                name="image"
                label={<span style={{ color: "#A05A2C" }}>Ảnh sản phẩm</span>}
                rules={[
                  {
                    required: modalMode === "add",
                    message: "Vui lòng tải lên ảnh sản phẩm!",
                  },
                ]}
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
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="preview"
                    width={100}
                    style={{ display: "block", marginTop: 8 }}
                  />
                )}
              </Form.Item>
              <Form.Item
                name="name"
                label={<span style={{ color: "#A05A2C" }}>Tên sản phẩm</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                ]}
              >
                <Input
                  placeholder="Ví dụ: Cơm tấm sườn bì chả"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
              <Form.Item
                name="description"
                label={<span style={{ color: "#A05A2C" }}>Mô tả</span>}
                rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Mô tả chi tiết về sản phẩm"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
              <Space
                align="start"
                style={{ display: "flex", marginBottom: 0 }}
                size="large"
              >
                <Form.Item
                  name="price"
                  label={<span style={{ color: "#A05A2C" }}>Giá</span>}
                  rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: "100%", borderRadius: 6 }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value: any) => value!.replace(/\$\s?|(,*)/g, "")}
                    placeholder="Ví dụ: 35000"
                    min={0}
                  />
                </Form.Item>
              </Space>
              <Form.Item
                label={<span style={{ color: "#A05A2C" }}>Nguyên liệu</span>}
                required
              >
                <Form.List name="recipes">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, _index) => (
                        <Space
                          key={field.key}
                          align="baseline"
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          <Form.Item
                            {...field}
                            name={[field.name, "materialId"]}
                            rules={[
                              { required: true, message: "Chọn nguyên liệu" },
                            ]}
                            style={{ minWidth: 200 }}
                          >
                            <Select
                              placeholder="Chọn nguyên liệu"
                              style={{ borderRadius: 6 }}
                            >
                              {materials.map((m) => (
                                <Option key={m.materialId} value={m.materialId}>
                                  {m.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, "quantity"]}
                            rules={[
                              { required: true, message: "Nhập số lượng" },
                            ]}
                          >
                            <InputNumber
                              min={1}
                              style={{ width: 120, borderRadius: 6 }}
                            />
                          </Form.Item>
                          {fields.length > 1 && (
                            <MinusCircleOutlined
                              onClick={() => remove(field.name)}
                              style={{ color: "#ff4d4f" }}
                            />
                          )}
                        </Space>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm nguyên liệu
                      </Button>
                    </>
                  )}
                </Form.List>
              </Form.Item>
              <Space
                align="start"
                style={{ display: "flex", marginBottom: 0 }}
                size="large"
              >
                <Form.Item
                  name="productTypeId"
                  label={
                    <span style={{ color: "#A05A2C" }}>Loại sản phẩm</span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn loại sản phẩm!" },
                  ]}
                  style={{ flex: 1 }}
                >
                  <Select
                    placeholder="Chọn loại sản phẩm"
                    style={{ borderRadius: 6 }}
                  >
                    {isProductTypesLoading ? (
                      <Option value="">Đang tải...</Option>
                    ) : (
                      productTypes?.map((type) => (
                        <Option
                          key={type.productTypeId}
                          value={type.productTypeId}
                        >
                          {type.name}
                        </Option>
                      ))
                    )}
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
