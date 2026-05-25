import { useEffect, useState } from "react";
import { Form, Input, Button, addToast } from "@heroui/react";
import logo from "../assets/CORPSEED.webp";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgetPasswordApi } from "../toolkit/slices/authSlice";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState();

  const handleFinish = (values) => {
    dispatch(forgetPasswordApi(values?.email)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "OTP sent to your email successfully !.",
          color: "success",
        });
        navigate(`/${values?.email}/otp`);
      } else {
        setLoading("error");
        addToast({
          title: "Error in sending OTP !.",
          color: "danger",
        });
      }
    });
  };

  useEffect(() => {
    const userDetail = sessionStorage.getItem("userDetail");

    if (userDetail) {
      const user = JSON.parse(userDetail);
      if (user?.id) {
        navigate(`/erp/${user.id}/dashboard`);
      }
    }
  }, [navigate]);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[30%] flex flex-col items-center gap-4 shadow-lg px-8 py-12 rounded-lg dark:bg-gray-700">
        <span className="text-xl font-bold text-neutral-800 dark:text-white">
          <img src={logo} alt="corpseed" style={{ height: "68px" }} />
        </span>
        <Form
          className="w-full max-w-lg flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            let data = Object.fromEntries(new FormData(e.currentTarget));
            handleFinish(data);
          }}
        >
          <Input
            isRequired
            errorMessage="Please enter a valid email"
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Enter your email"
            type="email"
          />
          <div className="flex justify-center gap-2 w-full">
            <Button
              color="primary"
              type="submit"
              isLoading={loading === "pending"}
              className="w-full"
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
