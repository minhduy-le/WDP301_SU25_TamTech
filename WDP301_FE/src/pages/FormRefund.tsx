/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Input, Select, message } from "antd";
import { useState } from "react";
import { useCreateBankUser, useGetBank } from "../hooks/ordersApi";
import "../style/FormRefund.css";
import { useLocation, useNavigate } from "react-router-dom";

const { Option } = Select;

const FormRefund = () => {
  const [form] = Form.useForm();
  const { data: bankData, isLoading } = useGetBank();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId") || "N/A";
  const { mutate: createBankUser } = useCreateBankUser();

  const handleSubmit = (values: any) => {
    setIsSubmitting(true);
    const bankData = {
      userId: parseInt(userId, 10),
      bankName: values.bankName,
      bankNumber: values.bankNumber,
    };

    createBankUser(bankData, {
      onSuccess: () => {
        message.success(
          "Yêu cầu hoàn tiền đã được gửi thành công hãy chờ gửi chứng từ hoàn tiền qua email!"
        );
        form.resetFields();
        setIsSubmitting(false);
        navigate("/");
      },
      onError: (error: any) => {
        const errorMessage = error?.message || "Đã xảy ra lỗi khi gửi yêu cầu!";
        message.error(errorMessage);
        setIsSubmitting(false);
      },
    });
  };

  if (isLoading) {
    return <div>Đang tải thông tin ngân hàng...</div>;
  }

  return (
    <div className="refund-form-container">
      <div className="refund-title">Yêu cầu hoàn tiền</div>
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
          <Input
            placeholder="Nhập số tài khoản"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            style={{
              width: "100%",
              marginTop: "20px",
              fontFamily: "'Montserrat', sans-serif",
              backgroundColor: "#78a243",
              fontSize: 17,
              height: 40,
            }}
          >
            Gửi yêu cầu hoàn tiền
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FormRefund;
