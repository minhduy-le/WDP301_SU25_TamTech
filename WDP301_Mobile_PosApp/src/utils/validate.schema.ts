import * as Yup from "yup";

export const StaffSignInSchema = Yup.object().shape({
  email: Yup.string().required("Email không được để trống"),
  password: Yup.string().required("Password không được để trống"),
});
