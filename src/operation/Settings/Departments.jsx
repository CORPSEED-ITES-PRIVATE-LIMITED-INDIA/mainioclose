import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDepartments,
  getDepartmentAutoConfig,
  updateDepartmentAutoConfig,
} from "./../../toolkit/slices/operationSlice";
import { Card, CardBody, Switch, Button, addToast } from "@heroui/react";
import { ChevronRight, X } from "lucide-react";

const Departments = () => {
  const dispatch = useDispatch();
  const { departmentsList, departmentAutoConfig, loading } = useSelector(
    (state) => state.operation,
  );

  const [selectedDept, setSelectedDept] = useState(null);
  const [localConfig, setLocalConfig] = useState(null);

  useEffect(() => {
    dispatch(getDepartments({ page: 0, size: 100 }));
  }, [dispatch]);

  const handleDepartmentClick = (dept) => {
    setSelectedDept(dept);
    dispatch(getDepartmentAutoConfig(dept.id));
  };

  useEffect(() => {
    if (departmentAutoConfig) {
      setLocalConfig({ ...departmentAutoConfig });
    }
  }, [departmentAutoConfig]);

  const handleToggle = (key, value) => {
    setLocalConfig((prev) => {
      const updated = { ...prev, [key]: value };

      // Auto vs Manual conflict
      if (key === "manualOnly" && value) updated.autoAssignmentEnabled = false;
      if (key === "autoAssignmentEnabled" && value) updated.manualOnly = false;

      // Prevent both from being false
      if (key === "manualOnly" && !value && !updated.autoAssignmentEnabled) {
        updated.manualOnly = true;
        addToast({
          title: "Warning",
          description: "At least Auto or Manual must be enabled",
          color: "warning",
          position: "bottom-right",
          duration: 2500,
        });
      }

      if (key === "autoAssignmentEnabled" && !value && !updated.manualOnly) {
        updated.autoAssignmentEnabled = true;
        addToast({
          title: "Warning",
          description: "At least Auto or Manual must be enabled",
          color: "warning",
          position: "bottom-right",
          duration: 2500,
        });
      }

      return updated;
    });
  };

  const isChanged =
    localConfig &&
    departmentAutoConfig &&
    JSON.stringify(localConfig) !== JSON.stringify(departmentAutoConfig);

  const getEnabledFeatures = () => {
    if (!localConfig.autoAssignmentEnabled) return "None";

    const features = [];
    if (localConfig.roundRobinEnabled) features.push("Round-Robin");
    if (localConfig.availabilityRequired) features.push("Availability Check");
    if (localConfig.ratingPrioritizationEnabled)
      features.push("Rating Prioritization");
    if (localConfig.companyAlignmentEnabled) features.push("Company Alignment");

    return features.length ? features.join(", ") : "None";
  };

  const handleUpdate = async () => {
    if (!selectedDept || !localConfig) return;

    if (!localConfig.autoAssignmentEnabled && !localConfig.manualOnly) {
      addToast({
        title: "Error",
        description: "At least Auto or Manual must be enabled",
        color: "danger",
        position: "bottom-right",
        duration: 2500,
      });
      return;
    }

    const payload = {
      ...localConfig,
      enabledFeatures: getEnabledFeatures(),
    };

    if (!payload.autoAssignmentEnabled) {
      payload.availabilityRequired = false;
      payload.roundRobinEnabled = false;
      payload.ratingPrioritizationEnabled = false;
      payload.companyAlignmentEnabled = false;
    }

    const deptId = selectedDept.id || selectedDept.departmentId;

    const result = await dispatch(
      updateDepartmentAutoConfig({ id: deptId, data: payload }),
    );

    if (updateDepartmentAutoConfig.fulfilled.match(result)) {
      addToast({
        title: "Success",
        description: "Auto-config updated successfully!",
        color: "success",
        position: "bottom-right",
        duration: 2500,
      });
    } else if (updateDepartmentAutoConfig.rejected.match(result)) {
      addToast({
        title: "Error",
        description: result.payload?.message || "Update failed!",
        color: "danger",
        position: "bottom-right",
        duration: 2500,
      });
    }
  };

  const handleCancel = () => {
    setLocalConfig({ ...departmentAutoConfig });
    addToast({
      title: "Warning",
      description: "Changes discarded",
      color: "warning",
      position: "bottom-right",
      duration: 2500,
    });
  };

  const handleCut = () => setSelectedDept(null);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Department list
      </h1>

      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Departments List */}
        <Card
          shadow="none"
          className="w-full rounded-lg border border-gray-200 dark:border-white/10 sm:w-[300px] sm:shrink-0"
        >
          <CardBody className="gap-1 p-3">
            <h2 className="text-[11.5px] font-semibold uppercase tracking-wide text-default-500 px-1 mb-1">
              Departments
            </h2>

            <div className="flex max-h-[calc(100vh-260px)] flex-col gap-0.5 overflow-y-auto">
              {departmentsList?.map((dept) => (
                <div
                  key={dept.id}
                  className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors duration-150 ${
                    selectedDept?.id === dept.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-default-100"
                  }`}
                  onClick={() => handleDepartmentClick(dept)}
                >
                  <p className="text-[12.5px] font-medium">{dept.name}</p>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Selected Department Auto-Config */}
        {selectedDept && localConfig && (
          <Card
            shadow="none"
            className="relative flex-1 rounded-lg border border-gray-200 dark:border-white/10"
          >
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              className="absolute top-3 right-3 z-20"
              onPress={handleCut}
            >
              <X className="w-4 h-4" />
            </Button>

            <CardBody className="gap-3 p-4">
              <h2 className="text-[12.5px] font-semibold text-foreground pr-8">
                {selectedDept.name}
              </h2>

              {loading === "pending" && (
                <p className="text-[12.5px] text-default-400">
                  Loading auto config...
                </p>
              )}

              <div className="flex flex-col gap-0.5">
                {Object.entries(localConfig)
                  .filter(([key, val]) => typeof val === "boolean")
                  .map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-default-100"
                    >
                      <span className="text-[12.5px] capitalize text-default-600">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>

                      <Switch
                        size="sm"
                        isSelected={val}
                        onChange={(e) => handleToggle(key, e.target.checked)}
                      />
                    </div>
                  ))}
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  color="primary"
                  onPress={handleUpdate}
                  disabled={!isChanged || loading === "pending"}
                >
                  Update
                </Button>

                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Departments;
