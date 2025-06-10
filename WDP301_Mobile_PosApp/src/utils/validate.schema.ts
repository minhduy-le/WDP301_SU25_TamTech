import * as Yup from "yup";

export const StaffSignInSchema = Yup.object().shape({
  email: Yup.string().required("Email không được để trống"),
  password: Yup.string().required("Password không được để trống"),
});
export const ChangePasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password cần tối thiểu 6 kí tự")
    .max(50, "Password tối đa 50 ký tự")
    .matches(/[0-9]/, "Password phải chứa ít nhất một chữ số")
    .matches(/[^a-zA-Z0-9]/, "Password phải chứa ít nhất một ký tự đặc biệt")
    .required("Password không được để trống"),

  cofirmPassword: Yup.string()
    .min(6, "Password cần tối thiểu 6 kí tự")
    .max(50, "Password tối đa 50 ký tự")
    .matches(/[0-9]/, "Password phải chứa ít nhất một chữ số")
    .matches(/[^a-zA-Z0-9]/, "Password phải chứa ít nhất một ký tự đặc biệt")
    .required("Password không được để trống")
    .oneOf([Yup.ref("password")], "Mật khẩu xác nhận không khớp"),
});
