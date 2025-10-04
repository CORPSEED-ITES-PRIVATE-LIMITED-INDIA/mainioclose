import { Button } from "@heroui/button";
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import { getAllVendorsStatus } from "../toolkit/slices/vendorsSlice";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = () =>
  z.object({
    requestStatus: z.string().min(1, "Please select status"),
    quotationFilePath: z.string().min(1, "Please upload document"),
    quotationAmount: z.number(),
    additionalMailId: z.string().optional(),
    agreementName: z.string().optional(),
    agreementWithClientDocumentPath: z.string().optional(),
    researchName: z.string().optional(),
    researchDocumentPath: z.string().optional(),
    cancelReason: z.string().min(1, "Please enter reason"),
    internalVendorPrices: z.string().optional().or(z.literal("")),
    externalVendorPrice: z.string().optional().or(z.literal("")),
    comment: z.string().optional().or(z.literal("")),
  });

const defaultValues = {
  requestStatus: "",
  quotationFilePath: "",
  quotationAmount: "",
  additionalMailId: "",
  agreementName: "",
  agreementWithClientDocumentPath: "",
  researchName: "",
  researchDocumentPath: "",
  cancelReason: "",
  internalVendorPrices: "",
  externalVendorPrice: "",
  comment: "",
};

const VendorRequestDetail = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const vendorsStatus = useSelector((state) => state.vendors.vendorsStatus);
  const [statusIsFinished, setStatusIsFinished] = useState(false);
  const [statusIsCanceled, setStatusIsCanceled] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleUpdateBtn = () => {
    onOpen();
    dispatch(getAllVendorsStatus());
  };

  return (
    <div>
      <div className="w-full flex justify-between px-2">
        <div></div>
        <Button onPress={handleUpdateBtn}>Update status</Button>
      </div>
      <Modal
        size="3xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add vendors request</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="requestStatus"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          label="Status"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={vendorsStatus || []}
                          labelKey="statusName"
                          valueKey="statusName"
                          name="requestStatus"
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    {statusIsFinished && (
                      <>
                        <Controller
                          name="quotationFilePath"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <FileUploader
                              uploadingType="multiple"
                              isRequired
                              label="Reference attachements"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="quotationAmount"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Quotation amount"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="additionalMailId"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Additional email"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="agreementName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Agreement name"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="agreementWithClientDocumentPath"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <FileUploader
                              uploadingType="multiple"
                              label="Agreement attachements"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="researchName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Research name"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="researchDocumentPath"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <FileUploader
                              uploadingType="multiple"
                              label="Research attachements"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}

                    {statusIsCanceled && (
                      <>
                        <Controller
                          name="cancelReason"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Reason"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="internalVendorPrices"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Amount given to vendor"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="externalVendorPrice"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Amount given by vendor"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </>
                    )}
                  </div>

                  <ModalFooter className="flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default VendorRequestDetail;
