import { Input } from "@heroui/input";
import { Controller } from "react-hook-form";

const FormInput = ({ label, name, control, error }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          label={label}
          {...field}
          isInvalid={!!error}
          errorMessage={error?.message}
        />
      )}
    />
  );
};

export default FormInput
