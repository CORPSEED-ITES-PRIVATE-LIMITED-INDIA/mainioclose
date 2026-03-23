import { Controller } from "react-hook-form";
import NewSelect from "./NewSelect";

const FormSelect = ({
  name,
  control,
  label,
  data = [],
  labelKey = "label",
  valueKey = "value",
  size = "md",
  onChangeExtra,
  isRequired = false,
  endContent,
  isOpen,
  onOpenChange,
  onItemSelect = () => {},
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <NewSelect
            label={label}
            size={size}
            data={data}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isRequired={isRequired}
            labelKey={labelKey}
            valueKey={valueKey}
            value={field.value}
            isInvalid={!!error}
            errorMessage={error?.message}
            endContent={endContent}
            onChange={(value) => {
              onChangeExtra?.(value);
              field.onChange(value);
            }}
            onItemSelect={onItemSelect}
          />
        );
      }}
    />
  );
};

export default FormSelect;
