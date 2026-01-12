import { Input } from "@heroui/input";
import { Controller } from "react-hook-form";

const FormInput = ({ label, name, control, error, readOnly = false }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          label={label}
          {...field}
          isInvalid={!!error}
          readOnly={readOnly}
          errorMessage={error?.message}
        />
      )}
    />
  );
};

export default FormInput;
