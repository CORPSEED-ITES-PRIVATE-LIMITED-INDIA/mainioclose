import { Button } from "@heroui/button";
import { Input, useDisclosure } from "@heroui/react";
import { useState } from "react";

const VendorRequestDetail = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [statusIsFinished, setStatusIsFinished] = useState(false);

  return (
    <div>
      <div className="w-full flex justify-between px-2">
        <div></div>
        <Button onPress={onOpen}>Update status</Button>
      </div>
      {/* <Modal
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
                          data={vendorsCategoryList || []}
                          labelKey="statusName"
                          valueKey="statusName"
                          name="requestStatus"
                          value={field.value}
                          onChange={(value) => {
                            dispatch(getSingleCategoryDataById(value));
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
                          name="companyName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Company name"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                      </>
                    )}

                    <Controller
                      name="subVendorCategoryId"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          label="Sub-Category"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          name="subVendorCategoryId"
                          data={subCategoryList || []}
                          labelKey="subCategoryName"
                          valueKey="subCategoryId"
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="clientMobileNumber"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Contact number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="clientBudgetPrice"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Client budget"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="description"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Description"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                        />
                      )}
                    />
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
      </Modal> */}
    </div>
  );
};

export default VendorRequestDetail;
