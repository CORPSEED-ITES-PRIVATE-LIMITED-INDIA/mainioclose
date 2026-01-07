import { Controller } from "react-hook-form";
import NewSelect from "./NewSelect";

const FormSelect=({
  name,
  control,
  label,
  data = [],
  labelKey = "label",
  valueKey = "value",
  size = "md",
  onChangeExtra,
})=> {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <NewSelect
          label={label}
          size={size}
          data={data}
          labelKey={labelKey}
          valueKey={valueKey}
          value={field.value}
          isInvalid={!!error}
          errorMessage={error?.message}
          onChange={(value) => {
            onChangeExtra?.(value);
            field.onChange(value);
          }}
        />
      )}
    />
  );
}


export default FormSelect