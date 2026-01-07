import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadEstimateSchema } from "./lead"

const Input = ({ field, placeholder }) => (
  <input {...field} placeholder={placeholder} className="border p-2 w-full" />
);

const AddressSection = ({ title, control, errors, name }) => (
  <div className="border p-4 rounded space-y-3">
    <h3 className="font-semibold">{title}</h3>

    <Controller name={`${name}.addressLine`} control={control}
      render={({ field }) => <Input field={field} placeholder="Address" />} />
    <p className="text-red-500">{errors?.addressLine?.message}</p>

    <Controller name={`${name}.country`} control={control}
      render={({ field }) => <Input field={field} placeholder="Country" />} />
    <p className="text-red-500">{errors?.country?.message}</p>

    <Controller name={`${name}.state`} control={control}
      render={({ field }) => <Input field={field} placeholder="State" />} />
    <p className="text-red-500">{errors?.state?.message}</p>

    <Controller name={`${name}.city`} control={control}
      render={({ field }) => <Input field={field} placeholder="City" />} />
    <p className="text-red-500">{errors?.city?.message}</p>

    <Controller name={`${name}.pinCode`} control={control}
      render={({ field }) => <Input field={field} placeholder="Pin Code" />} />
    <p className="text-red-500">{errors?.pinCode?.message}</p>
  </div>
);

const LeadEstimates = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(leadEstimateSchema),
    defaultValues: {
      companyName: "",
      companyUnit: "",
      billingAddress: {
        addressLine: "",
        country: "",
        state: "",
        city: "",
        pinCode: "",
      },
      shippingAddress: {
        addressLine: "",
        country: "",
        state: "",
        city: "",
        pinCode: "",
      },
    },
  });

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <Controller name="companyName" control={control}
        render={({ field }) => <Input field={field} placeholder="Company Name" />} />
      <p className="text-red-500">{errors.companyName?.message}</p>

      <Controller name="companyUnit" control={control}
        render={({ field }) => (
          <select {...field} className="border p-2 w-full">
            <option value="">Select Unit</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="sales">Sales</option>
            <option value="warehouse">Warehouse</option>
          </select>
        )} />
      <p className="text-red-500">{errors.companyUnit?.message}</p>

      <AddressSection title="Billing Address"
        name="billingAddress" control={control} errors={errors.billingAddress} />

      <AddressSection title="Shipping Address"
        name="shippingAddress" control={control} errors={errors.shippingAddress} />

      <button className="bg-blue-600 text-white px-6 py-2 rounded">
        Save Lead Estimate
      </button>
    </form>
  );
};

export default LeadEstimates;
