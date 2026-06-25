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
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Department list</h1>
      <div className="flex gap-6 p-6">
        {/* Departments List */}
        <Card className="p-4 rounded-2xl shadow-md w-[350px] h-[70%]">
          <h1 className="text-xl font-semibold mb-3 grey-500">Departments</h1>
          <CardBody className="gap-[1.5]">
            {departmentsList?.map((dept) => (
              <div
                key={dept.id}
                className={`cursor-pointer flex justify-between items-center 
                ${selectedDept?.id === dept.id ? "bg-gray-100" : "hover:bg-gray-100"} 
                transition-colors duration-150 py-2 px-3 rounded`}
                onClick={() => handleDepartmentClick(dept)}
              >
                <p className="font-sm">{dept.name}</p>
                <ChevronRight size={18} />
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Selected Department Auto-Config */}
        {selectedDept && localConfig && (
          <Card className="flex-1 p-4 rounded-2xl shadow-md relative h-[70%]">
            <h2 className="text-xl font-semibold mb-3">{selectedDept.name}</h2>
            <Button
              size="sm"
              variant="light"
              color="danger"
              className="absolute top-2 right-2 z-20"
              onPress={handleCut}
            >
              <X size={16} />
            </Button>

            <CardBody>
              {loading === "pending" && <p>Loading auto config...</p>}

              <div className="mt-1   space-y-3">
                {Object.entries(localConfig)
                  .filter(([key, val]) => typeof val === "boolean")
                  .map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-1 px-2 rounded hover:bg-gray-100 transition-colors duration-150"
                    >
                      <span className="capitalize text-sm">
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

              <div className="flex gap-3 mt-6">
                <Button
                  color="primary"
                  onPress={handleUpdate}
                  disabled={!isChanged || loading === "pending"}
                >
                  Update
                </Button>

                <Button color="danger" variant="light" onPress={handleCancel}>
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
};

export default Departments;
