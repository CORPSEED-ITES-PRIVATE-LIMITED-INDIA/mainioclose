import { useState } from "react";
import { Form, Input, Button, addToast, InputOtp } from "@heroui/react";
import logo from "../assets/CORPSEED.webp";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updatePassword } from "../toolkit/slices/authSlice";

const Otp = () => {
  const { email } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState();
  const [passwordError, setPasswordError] = useState("");

  const handleFinish = (values) => {
    const { password, confirmPassword } = values;

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    dispatch(updatePassword({email,...values})).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Password updated successfully !.",
          color: "success",
        });
        navigate(`/login`);
      } else {
        setLoading("error");
        addToast({
          title: "Something went wrong !.",
          color: "danger",
        });
      }
    });
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[30%] flex flex-col items-center gap-4 shadow-lg px-8 py-12 rounded-lg dark:bg-gray-700">
        <span className="text-xl font-bold text-neutral-800 dark:text-white">
          <img src={logo} alt="corpseed" style={{ height: "68px" }} />
        </span>
        <Form
          className="w-full max-w-lg flex flex-col gap-8"
          onReset={() => setAction("reset")}
          onSubmit={(e) => {
            e.preventDefault();
            let data = Object.fromEntries(new FormData(e.currentTarget));
            handleFinish(data);
          }}
        >
          <p className="text-small m-0">
            OTP <span className="text-red-500">*</span>
          </p>
          <InputOtp
            length={6}
            name="otp"
            label="OTP"
            labelPlacement="outside"
            isRequired
            errorMessage="please enter otp"
          />
          <Input
            isRequired
            errorMessage="Please enter a valid email"
            label="New password"
            labelPlacement="outside"
            name="password"
            placeholder="Enter your new password"
            type="password"
          />
          <Input
            isRequired
            label="Confirm password"
            name="confirmPassword"
            placeholder="Enter your confirm password"
            type="password"
            labelPlacement="outside"
            isInvalid={!!passwordError}
            errorMessage={passwordError}
            onChange={() => setPasswordError("")}
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

export default Otp;
