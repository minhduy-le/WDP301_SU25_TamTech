import { Button, Form, Input, Select, message } from "antd";
import { useState } from "react";
import { useGetBank } from "../hooks/ordersApi";
import "../style/FormRefund.css";

const { Option } = Select;

const FormRefund = () => {
  const [form] = Form.useForm();
  const { data: bankData, isLoading } = useGetBank();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      message.success("Yêu cầu hoàn tiền đã được gửi thành công!");
      form.resetFields();
      setIsSubmitting(false);
    }, 1000);
  };

  if (isLoading) {
    return <div>Đang tải thông tin ngân hàng...</div>;
  }

  return (
    <div className="refund-form-container">
      <div className="refund-title">Yêu cầu hoàn tiền</div>
      {/* <Divider style={{ borderTop: "1px solid #2D1E1A", margin: "12px 0" }} /> */}
      <Form
        form={form}
        name="refundForm"
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        <Form.Item
          name="bankName"
          label="Chọn ngân hàng"
          rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
        >
          <Select placeholder="Chọn ngân hàng">
            {bankData?.data?.map((bank: { id: number; name: string }) => (
              <Option key={bank.id} value={bank.name}>
                {bank.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="bankNumber"
          label="Số tài khoản"
          rules={[
            { required: true, message: "Vui lòng nhập số tài khoản!" },
            {
              pattern: /^\d+$/,
              message: "Số tài khoản phải là số!",
            },
          ]}
        >
          <Input placeholder="Nhập số tài khoản" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            style={{ width: "100%", marginTop: "20px" }}
          >
            Gửi yêu cầu hoàn tiền
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FormRefund;
