import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Textarea,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  getDepartmentAssignmentConfiguration,
  updateDepartmentAssignmentConfiguration,
  updateDepartmentAssignmentStrategy,
  updateDepartmentAutoAssignmentStatus,
  updateDepartmentFeatureStatus,
  updateDepartmentLoginCheckStatus,
  updateDepartmentManualAssignmentStatus,
} from "../../toolkit/slices/settingSlice";

// Only strategy supported today. Kept as a list (not a hard-coded string) so
// a future strategy only needs adding here.
const ASSIGNMENT_STRATEGY_OPTIONS = [
  { label: "Round Robin", value: "ROUND_ROBIN" },
];

const configFormSchema = z.object({
  assignmentStrategy: z.string().min(1, "Please select an assignment strategy."),
  featureEnabled: z.boolean(),
  loginCheckEnabled: z.boolean(),
  autoAssignmentEnabled: z.boolean(),
  manualAssignmentEnabled: z.boolean(),
  reason: z.string().min(1, "Please enter a reason."),
});

const configDefaultValues = {
  assignmentStrategy: "ROUND_ROBIN",
  featureEnabled: false,
  loginCheckEnabled: false,
  autoAssignmentEnabled: false,
  manualAssignmentEnabled: false,
  reason: "",
};

const reasonFormSchema = z.object({
  reason: z.string().min(1, "Please enter a reason."),
});

const reasonDefaultValues = { reason: "" };

const strategyFormSchema = z.object({
  assignmentStrategy: z.string().min(1, "Please select an assignment strategy."),
  reason: z.string().min(1, "Please enter a reason."),
});

const strategyDefaultValues = {
  assignmentStrategy: "ROUND_ROBIN",
  reason: "",
};

const DepartmentAssignmentConfiguration = () => {
  const dispatch = useDispatch();
  const { departmentId } = useParams();
  const location = useLocation();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const updatedByUserId = currentUser?.id || currentUser?.userId;

  const configuration = useSelector(
    (state) => state.setting.departmentAssignmentConfiguration,
  );
  const isConfigLoading =
    useSelector((state) => state.setting.departmentAssignmentConfigLoading) ===
    "pending";

  const departmentName =
    location?.state?.departmentName || configuration?.departmentName || "Department";

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [toggleModalItem, setToggleModalItem] = useState(null);
  const toggleModal = useDisclosure();
  const strategyModal = useDisclosure();

  const configForm = useForm({
    resolver: zodResolver(configFormSchema),
    defaultValues: configDefaultValues,
  });

  const toggleReasonForm = useForm({
    resolver: zodResolver(reasonFormSchema),
    defaultValues: reasonDefaultValues,
  });

  const strategyForm = useForm({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: strategyDefaultValues,
  });

  useEffect(() => {
    if (departmentId) {
      dispatch(getDepartmentAssignmentConfiguration(departmentId));
    }
  }, [dispatch, departmentId]);

  useEffect(() => {
    if (configuration) {
      configForm.reset({
        assignmentStrategy: configuration?.assignmentStrategy || "ROUND_ROBIN",
        featureEnabled: !!configuration?.featureEnabled,
        loginCheckEnabled: !!configuration?.loginCheckEnabled,
        autoAssignmentEnabled: !!configuration?.autoAssignmentEnabled,
        manualAssignmentEnabled: !!configuration?.manualAssignmentEnabled,
        reason: "",
      });
    }
  }, [configuration]);

  // Each row below is backed by its own PATCH endpoint, independent of the
  // full-configuration PUT form above it.
  const CONFIG_ITEMS = useMemo(
    () => [
      {
        key: "featureEnabled",
        label: "Feature Enabled",
        description: "Turns the department-assignment feature on or off.",
        thunk: updateDepartmentFeatureStatus,
      },
      {
        key: "loginCheckEnabled",
        label: "Login Check",
        description: "Requires an active login session before assigning leads.",
        thunk: updateDepartmentLoginCheckStatus,
      },
      {
        key: "autoAssignmentEnabled",
        label: "Auto Assignment",
        description: "Automatically assigns leads using the selected strategy.",
        thunk: updateDepartmentAutoAssignmentStatus,
      },
      {
        key: "manualAssignmentEnabled",
        label: "Manual Assignment",
        description: "Allows leads to be assigned manually.",
        thunk: updateDepartmentManualAssignmentStatus,
      },
    ],
    [],
  );

  const openToggleModal = (item, pendingValue) => {
    setToggleModalItem({ ...item, pendingValue });
    toggleReasonForm.reset(reasonDefaultValues);
    toggleModal.onOpen();
  };

  const handleToggleSubmit = (values) => {
    if (!toggleModalItem) return;

    setIsSavingItem(true);

    dispatch(
      toggleModalItem.thunk({
        departmentId,
        data: {
          enabled: toggleModalItem.pendingValue,
          updatedByUserId,
          reason: values.reason,
        },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: `${toggleModalItem.label} updated successfully.`,
            color: "success",
          });
          toggleModal.onOpenChange(false);
          toggleReasonForm.reset(reasonDefaultValues);
          setToggleModalItem(null);
        } else {
          addToast({
            title: resp?.payload?.status || "ERROR",
            description:
              resp?.payload?.data?.message ||
              resp?.payload?.message ||
              "Something went wrong while updating this item.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "ERROR",
          description: "Something went wrong while updating this item.",
          color: "danger",
        });
      })
      .finally(() => setIsSavingItem(false));
  };

  const openStrategyModal = () => {
    strategyForm.reset({
      assignmentStrategy: configuration?.assignmentStrategy || "ROUND_ROBIN",
      reason: "",
    });
    strategyModal.onOpen();
  };

  const handleStrategySubmit = (values) => {
    setIsSavingItem(true);

    dispatch(
      updateDepartmentAssignmentStrategy({
        departmentId,
        data: {
          assignmentStrategy: values.assignmentStrategy,
          updatedByUserId,
          reason: values.reason,
        },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Assignment strategy updated successfully.",
            color: "success",
          });
          strategyModal.onOpenChange(false);
          strategyForm.reset(strategyDefaultValues);
        } else {
          addToast({
            title: resp?.payload?.status || "ERROR",
            description:
              resp?.payload?.data?.message ||
              resp?.payload?.message ||
              "Something went wrong while updating the strategy.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "ERROR",
          description: "Something went wrong while updating the strategy.",
          color: "danger",
        });
      })
      .finally(() => setIsSavingItem(false));
  };

  const handleSaveConfiguration = useCallback(
    (values) => {
      setIsSavingConfig(true);

      dispatch(
        updateDepartmentAssignmentConfiguration({
          departmentId,
          data: {
            featureEnabled: values.featureEnabled,
            loginCheckEnabled: values.loginCheckEnabled,
            autoAssignmentEnabled: values.autoAssignmentEnabled,
            manualAssignmentEnabled: values.manualAssignmentEnabled,
            assignmentStrategy: values.assignmentStrategy,
            updatedByUserId,
            reason: values.reason,
          },
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "SUCCESS",
              description: "Configuration saved successfully.",
              color: "success",
            });
            configForm.setValue("reason", "");
          } else {
            addToast({
              title: resp?.payload?.status || "ERROR",
              description:
                resp?.payload?.data?.message ||
                resp?.payload?.message ||
                "Something went wrong while saving the configuration.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "ERROR",
            description: "Something went wrong while saving the configuration.",
            color: "danger",
          });
        })
        .finally(() => setIsSavingConfig(false));
    },
    [dispatch, departmentId, updatedByUserId, configForm],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link
            to=".."
            className="text-xs text-blue-600 hover:underline"
          >
            &larr; Back to departments
          </Link>

          <h1 className="font-sans text-lg font-semibold mt-1">
            {departmentName} Department Assignment
          </h1>
        </div>

        {configuration ? (
          <Chip
            size="sm"
            variant="flat"
            color={configuration?.active ? "success" : "default"}
          >
            {configuration?.active ? "Active" : "Inactive"}
          </Chip>
        ) : null}
      </div>

      {configuration ? (
        <Card shadow="sm">
          <CardBody className="flex flex-row flex-wrap gap-6 text-[12.5px] text-default-500">
            <span>
              <span className="text-default-400">Last updated by:</span>{" "}
              {configuration?.updatedByUserName || "-"}
            </span>

            <span>
              <span className="text-default-400">Last updated at:</span>{" "}
              {configuration?.updatedAt
                ? dayjs(configuration.updatedAt).format("YYYY-MM-DD HH:mm")
                : "-"}
            </span>

            <span>
              <span className="text-default-400">Last change reason:</span>{" "}
              {configuration?.lastChangeReason || "-"}
            </span>
          </CardBody>
        </Card>
      ) : null}

      <Card shadow="sm">
        <CardHeader className="flex flex-col items-start gap-1">
          <h2 className="text-base font-semibold">Configuration</h2>
          <p className="text-xs text-default-400">
            Saving here replaces the full configuration in one call.
          </p>
        </CardHeader>

        <Divider />

        <CardBody>
          <form
            className="flex flex-col gap-4"
            onSubmit={configForm.handleSubmit(handleSaveConfiguration)}
          >
            <Controller
              name="assignmentStrategy"
              control={configForm.control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Assignment strategy"
                  isRequired
                  isInvalid={!!error}
                  errorMessage={error?.message}
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    if (value !== undefined) field.onChange(value);
                  }}
                >
                  {ASSIGNMENT_STRATEGY_OPTIONS.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="featureEnabled"
                control={configForm.control}
                render={({ field }) => (
                  <Switch
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    size="sm"
                  >
                    Feature Enabled
                  </Switch>
                )}
              />

              <Controller
                name="loginCheckEnabled"
                control={configForm.control}
                render={({ field }) => (
                  <Switch
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    size="sm"
                  >
                    Login Check
                  </Switch>
                )}
              />

              <Controller
                name="autoAssignmentEnabled"
                control={configForm.control}
                render={({ field }) => (
                  <Switch
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    size="sm"
                  >
                    Auto Assignment
                  </Switch>
                )}
              />

              <Controller
                name="manualAssignmentEnabled"
                control={configForm.control}
                render={({ field }) => (
                  <Switch
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    size="sm"
                  >
                    Manual Assignment
                  </Switch>
                )}
              />
            </div>

            <Controller
              name="reason"
              control={configForm.control}
              render={({ field, fieldState: { error } }) => (
                <Textarea
                  label="Reason"
                  isRequired
                  isInvalid={!!error}
                  errorMessage={error?.message}
                  placeholder="Why is this configuration being saved?"
                  {...field}
                />
              )}
            />

            <div className="flex justify-end">
              <Button
                color="primary"
                type="submit"
                isDisabled={isConfigLoading}
                isLoading={isSavingConfig}
              >
                Save Configuration
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardHeader className="flex flex-col items-start gap-1">
          <h2 className="text-base font-semibold">Individual Controls</h2>
          <p className="text-xs text-default-400">
            Each control below updates only that item, and requires its own
            reason.
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="flex flex-col divide-y divide-default-100">
          <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
            <div>
              <p className="text-sm font-medium">Assignment Strategy</p>
              <p className="text-xs text-default-400">
                Strategy used to auto-assign leads within this department.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Chip size="sm" variant="flat">
                {configuration?.assignmentStrategy || "ROUND_ROBIN"}
              </Chip>

              <Button
                size="sm"
                variant="flat"
                onPress={openStrategyModal}
                isDisabled={!departmentId}
              >
                Update
              </Button>
            </div>
          </div>

          {CONFIG_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 py-3 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-default-400">{item.description}</p>
              </div>

              <Switch
                isSelected={!!configuration?.[item.key]}
                onValueChange={(checked) => openToggleModal(item, checked)}
                size="sm"
              />
            </div>
          ))}
        </CardBody>
      </Card>

      <Modal
        size="lg"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={toggleModal.isOpen}
        onOpenChange={(open) => {
          toggleModal.onOpenChange(open);
          if (!open) {
            setToggleModalItem(null);
            toggleReasonForm.reset(reasonDefaultValues);
          }
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {toggleModalItem
                  ? `${toggleModalItem.pendingValue ? "Enable" : "Disable"} ${toggleModalItem.label}`
                  : "Update item"}
              </ModalHeader>

              <ModalBody>
                <form
                  id="toggleReasonForm"
                  className="flex flex-col gap-4"
                  onSubmit={toggleReasonForm.handleSubmit(handleToggleSubmit)}
                >
                  <Controller
                    name="reason"
                    control={toggleReasonForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <Textarea
                        label="Reason"
                        isRequired
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        placeholder="Please enter the reason for this change."
                        {...field}
                      />
                    )}
                  />
                </form>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                <Button
                  color="primary"
                  type="submit"
                  form="toggleReasonForm"
                  isLoading={isSavingItem}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="lg"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={strategyModal.isOpen}
        onOpenChange={(open) => {
          strategyModal.onOpenChange(open);
          if (!open) {
            strategyForm.reset(strategyDefaultValues);
          }
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Update Assignment Strategy</ModalHeader>

              <ModalBody>
                <form
                  id="strategyReasonForm"
                  className="flex flex-col gap-4"
                  onSubmit={strategyForm.handleSubmit(handleStrategySubmit)}
                >
                  <Controller
                    name="assignmentStrategy"
                    control={strategyForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <Select
                        label="Assignment strategy"
                        isRequired
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys)[0];
                          if (value !== undefined) field.onChange(value);
                        }}
                      >
                        {ASSIGNMENT_STRATEGY_OPTIONS.map((option) => (
                          <SelectItem key={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />

                  <Controller
                    name="reason"
                    control={strategyForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <Textarea
                        label="Reason"
                        isRequired
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        placeholder="Please enter the reason for this change."
                        {...field}
                      />
                    )}
                  />
                </form>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                <Button
                  color="primary"
                  type="submit"
                  form="strategyReasonForm"
                  isLoading={isSavingItem}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DepartmentAssignmentConfiguration;
