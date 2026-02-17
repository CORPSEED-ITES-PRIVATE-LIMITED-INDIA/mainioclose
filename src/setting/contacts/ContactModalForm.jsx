"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
  Button,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  getClientDesiginationList,
} from "../../toolkit/slices/settingSlice";
import NewSelect from "../../components/NewSelect";

/* =========================
   ZOD SCHEMA
========================= */

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  emails: z.string().email("Invalid email"),
  contactNo: z.string().min(10, "Minimum 10 digits"),
  whatsappNo: z.string().min(10, "Minimum 10 digits"),
  designationId: z.string().min(1, "Designation required"),
  makePrimaryForCompany: z.boolean(),
  makeSecondaryForCompany: z.boolean(),
  makePrimaryForUnit: z.boolean(),
  makeSecondaryForUnit: z.boolean(),
});

/* =========================
   COMPONENT
========================= */

export default function ContactModalForm({
  onSubmit,
  buttonLabel = "Add Contact",
}) {
  const dispatch = useDispatch();
  const desiginationList = useSelector(
    (state) => state.setting.clientDesiginationList,
  );
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    dispatch(getClientDesiginationList());
  }, [dispatch]);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      title: "",
      emails: "",
      contactNo: "",
      whatsappNo: "",
      departmentId: "",
      designationId: "",
      makePrimaryForCompany: false,
      makeSecondaryForCompany: false,
      makePrimaryForUnit: false,
      makeSecondaryForUnit: false,
    },
  });

  const handleFormSubmit = (data) => {
    if (onSubmit) onSubmit(data);
    reset();
    setIsOpen(false);
  };

  return (
    <>
      <Button color="primary" onPress={() => setIsOpen(true)}>
        {buttonLabel}
      </Button>

      <Modal isOpen={isOpen} onOpenChange={setIsOpen} size="3xl">
        <ModalContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <ModalHeader>Add Contact</ModalHeader>

            <ModalBody>
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Name"
                      value={field.value}
                      onChange={field.onChange}
                      isInvalid={!!errors.name}
                      errorMessage={errors.name?.message}
                    />
                  )}
                />

                {/* Title */}
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Title"
                      value={field.value}
                      onChange={field.onChange}
                      isInvalid={!!errors.title}
                      errorMessage={errors.title?.message}
                    />
                  )}
                />

                {/* Email */}
                <Controller
                  name="emails"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Email"
                      type="email"
                      value={field.value}
                      onChange={field.onChange}
                      isInvalid={!!errors.emails}
                      errorMessage={errors.emails?.message}
                    />
                  )}
                />

                {/* Contact No */}
                <Controller
                  name="contactNo"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Contact Number"
                      value={field.value}
                      onChange={field.onChange}
                      isInvalid={!!errors.contactNo}
                      errorMessage={errors.contactNo?.message}
                    />
                  )}
                />

                {/* WhatsApp No */}
                <Controller
                  name="whatsappNo"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="WhatsApp Number"
                      value={field.value}
                      onChange={field.onChange}
                      isInvalid={!!errors.whatsappNo}
                      errorMessage={errors.whatsappNo?.message}
                    />
                  )}
                />

                {/* Designation */}
                <Controller
                  name="designationId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      isRequired={true}
                      size={isMedium ? "sm" : "md"}
                      label="Designation"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={desiginationList || []}
                      labelKey="name"
                      valueKey="id"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />

                {/* Checkboxes */}
                <Controller
                  name="makePrimaryForCompany"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={field.value}
                      onValueChange={field.onChange}
                    >
                      Primary for Company
                    </Checkbox>
                  )}
                />

                <Controller
                  name="makeSecondaryForCompany"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={field.value}
                      onValueChange={field.onChange}
                    >
                      Secondary for Company
                    </Checkbox>
                  )}
                />

                <Controller
                  name="makePrimaryForUnit"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={field.value}
                      onValueChange={field.onChange}
                    >
                      Primary for Unit
                    </Checkbox>
                  )}
                />

                <Controller
                  name="makeSecondaryForUnit"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={field.value}
                      onValueChange={field.onChange}
                    >
                      Secondary for Unit
                    </Checkbox>
                  )}
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
