import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password cần tối thiểu 6 ký tự")
    .max(50, "Password tối đa 50 ký tự")
    .required("Password không được để trống"),
  email: Yup.string()
    .email("Định dạng email không hợp lệ")
    .required("Email không được để trống"),
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

export const SignUpSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password cần tối thiểu 6 ký tự")
    .max(50, "Password tối đa 50 ký tự")
    .required("Password không được để trống"),
  email: Yup.string()
    .email("Định dạng email không hợp lệ")
    .required("Email không được để trống"),
  name: Yup.string().required("Họ tên không được để trống"),
  phoneNumber: Yup.string().required("Số điện thoại không được để trống"),
});
export const CustomerSignUpSchema = Yup.object().shape({
  fullName: Yup.string().required("Tên không được để trống "),
  phoneNumber: Yup.string().required("Số điện thoại không được để trống"),
  email: Yup.string().required("Email không được để trống"),
  password: Yup.string().required("Mật khẩu không được để trống"),
  confirmPassword: Yup.string()
    .required("Xác nhận mật khẩu không được để trống")
    .oneOf([Yup.ref("password")], "Không trùng với mật khẩu"),
});
export const CustomerSignInSchema = Yup.object().shape({
  phoneNumber: Yup.string().required("Số điện thoại không được để trống"),
  password: Yup.string().required("Password không được để trống"),
});
export const UpdateUserSchema = Yup.object().shape({
  name: Yup.string().required("Họ tên không được để trống"),
  phone: Yup.string().required("Số điện thoại không được để trống"),
});

export const UpdateUserPasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(6, "Mật khẩu hiện tại cần tối thiểu 6 ký tự")
    .max(50, "Mật khẩu hiện tại tối đa 50 ký tự")
    .required("Mật khẩu hiện tại không được để trống"),
  newPassword: Yup.string()
    .min(6, "Mật khẩu mới cần tối thiểu 6 ký tự")
    .max(50, "Mật khẩu mới tối đa 50 ký tự")
    .required("Mật khẩu mới không được để trống"),

  confirmNewPassword: Yup.string()
    .required("Mật khẩu xác nhận không được để trống")
    .oneOf([Yup.ref("newPassword")], "Không trùng với mật khẩu"),
});

export const RequestPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Định dạng email không hợp lệ")
    .required("Email không được để trống"),
});

export const ForgotPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password cần tối thiểu 6 ký tự")
    .max(50, "Password tối đa 50 ký tự")
    .required("Password không được để trống"),
  confirmPassword: Yup.string()
    .required("confirmPassword không được để trống")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  code: Yup.string().required("Code không được để trống"),
});
