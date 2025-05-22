import React, { useCallback, useEffect, useState } from "react";
import "./Department.scss";
import MainHeading from "../../../components/design/MainHeading";
import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Tag,
  Tooltip,
} from "antd";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import {
  addStatusInDepartment,
  createDepartment,
  createDesiginationByDepartmentId,
  getAllDepartment,
  getAllDesiginations,
} from "../../../Toolkit/Slices/SettingSlice";
import {
  createAuthDepartment,
  createDesiginationByDepartment,
} from "../../../Toolkit/Slices/AuthSlice";
import { playErrorSound, playSuccessSound } from "../../Common/Commons";
import { Icon } from "@iconify/react";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
import { getAllStatusData } from "../../../Toolkit/Slices/LeadSlice";

const Department = () => {
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [statusForm] = Form.useForm();
  const dispatch = useDispatch();
  const departmentList = useSelector((state) => state.setting.allDepartment);
  const getAllStatus = useSelector((state) => state.leads.getAllStatus);
  const desiginationList = useSelector(
    (state) => state.setting.desiginationList
  );
  const [openModal, setOpenModal] = useState(false);
  const [openDesiginationModal, setOpenDesiginationModal] = useState(false);
  const [departmentData, setDepartmentData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [statusModal, setStatusModal] = useState(false);

  useEffect(() => {
    dispatch(getAllDepartment());
    dispatch(getAllDesiginations());
    dispatch(getAllStatusData());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(departmentList);
  }, [departmentList]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = departmentList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleFinish = (values) => {
    dispatch(createAuthDepartment(values)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        const temp = resp?.payload?.data;
        dispatch(createDepartment({ name: temp?.name }))
          .then((info) => {
            if (info.meta.requestStatus === "fulfilled") {
              notification.success({
                message: "Department created successfully.",
              });
              playSuccessSound();
              setOpenModal(false);
              dispatch(getAllDepartment());
            } else if (info.meta.requestStatus === "rejected") {
              notification.error({
                message: "Something went wrong !.",
              });
              playErrorSound();
            }
          })
          .catch(() => {
            notification.error({
              message: "Something went wrong !.",
            });
            playErrorSound();
          });
      }
    });
  };

  const addDesigination = (data) => {
    setOpenDesiginationModal(true);
    form1.setFieldsValue({
      designation: data?.designations?.map((item) => item?.id),
    });
    setDepartmentData(data);
  };

  const handleDesiginations = useCallback(
    (values) => {
      values.id = departmentData?.id;
      dispatch(createDesiginationByDepartment(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            dispatch(createDesiginationByDepartmentId(values))
              .then((response) => {
                if (response.meta.requestStatus === "fulfilled") {
                  notification.success({
                    message: "Desigination added successfully",
                  });
                  setOpenDesiginationModal(false);
                  dispatch(getAllDepartment());
                } else {
                  notification.error({ message: "Something went wrong !." });
                }
              })
              .catch(() => {
                notification.error({ message: "Something went wrong !." });
              });
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong !." });
        });
    },
    [departmentData, dispatch]
  );

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
    },
    {
      title: "Department",
      dataIndex: "name",
    },
    {
      title: "Desiginations",
      dataIndex: "designations",
      render: (_, records) => {
        const tags = records?.designations?.map((item) => (
          <Tag className="tags">{item?.name}</Tag>
        ));
        return (
          <div className="tagContainer">
            {tags?.[0]}
            {tags?.length >= 2 && (
              <Tooltip
                title={tags}
                arrow={false}
                overlayStyle={{ maxWidth: "700px" }}
              >
                <Icon
                  icon="fluent:more-horizontal-24-regular"
                  height={BTN_ICON_HEIGHT}
                  width={BTN_ICON_WIDTH}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "departmentStatus",
      render: (_, records) => {
        const tags = records?.departmentStatus?.map((item) => (
          <Tag className="tags">{item?.name}</Tag>
        ));
        return (
          <div className="tagContainer">
            {tags?.[0]}
            {tags?.length >= 2 && (
              <Tooltip
                title={tags}
                arrow={false}
                overlayStyle={{ maxWidth: "700px" }}
              >
                <Icon
                  icon="fluent:more-horizontal-24-regular"
                  height={BTN_ICON_HEIGHT}
                  width={BTN_ICON_WIDTH}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Add desigination",
      dataIndex: "addDesigination",
      render: (_, records) => (
        <Button size="small" onClick={() => addDesigination(records)}>
          <Icon icon="fluent:add-16-filled" /> Add
        </Button>
      ),
    },
    {
      title: "Map status",
      dataIndex: "mapStatus",
      render: (_, records) => (
        <Button
          onClick={() => {
            statusForm.setFieldsValue({
              statusId: records?.departmentStatus?.map((item) => item?.id),
            });
            setDepartmentData(records);
            setStatusModal(true);
          }}
        >
          Status
        </Button>
      ),
    },
  ];

  const handleAddStatus = (values) => {
    dispatch(
      addStatusInDepartment({
        departmentId: departmentData?.id,
        ...values,
      })
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Status added successfully in department !.",
          });
          setStatusModal(false);
          dispatch(getAllDepartment());
          setDepartmentData(null);
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => {
        notification.error({ message: "Something went wrong !." });
      });
  };

  return (
    <div>
      <div className="create-user-box">
        <MainHeading data={`Department`} />
      </div>
      <div className="setting-table">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Input
            value={searchText}
            size="small"
            onChange={handleSearch}
            style={{ width: "220px" }}
            placeholder="search"
            prefix={<Icon icon="fluent:search-24-regular" />}
          />

          <Button
            type="primary"
            size="small"
            onClick={() => setOpenModal(true)}
          >
            Add department
          </Button>
        </div>
        <div className="table-responsive">
          <CommonTable
            data={filteredData}
            columns={columns}
            scroll={{ y: 550 }}
          />
        </div>
      </div>
      <Modal
        title={"Create department"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        okText="Submit"
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            label="Name "
            name="name"
            rules={[
              {
                required: true,
                message: "please write the something to comment. ",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add desiginations"
        open={openDesiginationModal}
        onCancel={() => setOpenDesiginationModal(false)}
        onClose={() => setOpenDesiginationModal(false)}
        okText="Submit"
        onOk={() => form1.submit()}
      >
        <Form layout="vertical" form={form1} onFinish={handleDesiginations}>
          <Form.Item
            label="Desiginations"
            name="designation"
            rules={[{ required: true, message: "please select department" }]}
          >
            <Select
              showSearch
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              options={
                desiginationList?.length > 0
                  ? desiginationList?.map((item) => ({
                      label: item?.name,
                      value: item?.id,
                    }))
                  : []
              }
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Map status with department"
        open={statusModal}
        onClose={() => setStatusModal(false)}
        onCancel={() => setStatusModal(false)}
        onOk={() => statusForm.submit()}
        okText="Submit"
      >
        <Form form={statusForm} layout="vertical" onFinish={handleAddStatus}>
          <Form.Item
            label="Status"
            name="statusId"
            rules={[{ required: true, message: "please select status" }]}
          >
            <Select
              mode="multiple"
              options={
                getAllStatus?.map((item) => ({
                  label: item?.name,
                  value: item?.id,
                })) || []
              }
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Department;
