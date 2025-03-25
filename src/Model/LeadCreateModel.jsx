import React, { useCallback, useEffect, useState } from "react";
import "./Model.css";
import { leadSource } from "../data/FakeData";
import { useParams } from "react-router";
import { Button, Form, Input, Modal, notification, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  createLeads,
  getAllLeads,
  getAllLeadUsers,
  handleLoadingState,
} from "../Toolkit/Slices/LeadSlice";
import { getHighestPriorityRole } from "../Main/Common/Commons";
import { getCompanyLeadsAction } from "../Toolkit/Slices/CompanySlice";

const LeadCreateModel = ({ leadByCompany, companyId }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { userid } = useParams();
  const allLeadUser = useSelector((state) => state.leads.allLeadUsers);
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const currentUserDetail = useSelector(
    (state) => state.auth.getDepartmentDetail
  );
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    dispatch(getAllLeadUsers());
    dispatch(handleLoadingState());
  }, [dispatch]);

  const handleOpenModal = () => {
    if (currentUserDetail?.department === "Sales") {
      notification.warning({
        message: "Please connect with Quality team to create lead",
      });
    } else {
      setOpenModal(true);
    }
  };

  const handleFinish = useCallback(
    (values) => {
      values.categoryId = "1";
      values.createdById = userid;
      values.serviceId = "1";
      values.industryId = "1";
      values.assigneeId =
        getHighestPriorityRole(currentRoles) === "ADMIN"
          ? values.assigneeId
          : userid;
      if (leadByCompany) {
        values.companyId = companyId;
      }
      dispatch(createLeads(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            setOpenModal(false);
            notification.success({
              message: `Lead created successfully and assigned to ${resp?.payload?.assignee?.fullName}`,
            });
            if (leadByCompany) {
              dispatch(getCompanyLeadsAction({ id: companyId }));
            } else {
              dispatch(
                getAllLeads({
                  userId: Number(userid),
                  userIdFilter: [],
                  statusId: [1],
                  toDate: "",
                  fromDate: "",
                  page: 1,
                  size: 50,
                })
              );
            }
            form.resetFields();
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    },

    [userid, dispatch, companyId, leadByCompany, currentRoles]
  );

  return (
    <>
      <div className="team-model">
        <Button type="primary" onClick={handleOpenModal}>
          Create lead
        </Button>
      </div>
      <Modal
        title="Create lead"
        centered
        width={"60%"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          scrollToFirstError
          style={{ maxHeight: "80vh", overflow: "auto" }}
        >
          <div className="form-grid-col-2">
            <Form.Item
              label="Lead name"
              name="leadName"
              rules={[
                { required: true, message: "please enter the lead name" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Client name"
              name="name"
              rules={[
                { required: true, message: "please enter the client name" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Client email" name="email">
              <Input />
            </Form.Item>
            <Form.Item
              label="Mobile number"
              name="mobileNo"
              rules={[
                {
                  required: true,
                  message: "please enter the mobile number",
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
            <Form.Item
              label="Company"
              name="urls"
              rules={[
                {
                  required: true,
                  message: "please enter the company",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="City" name="city">
              <Input />
            </Form.Item>
            <Form.Item label="State" name="state">
              <Input />
            </Form.Item>
            <Form.Item label="Ip Address" name="ipAddress">
              <Input />
            </Form.Item>
            {getHighestPriorityRole(currentRoles) === "ADMIN" && (
              <Form.Item label="Assignee user" name="assigneeId">
                <Select
                  showSearch
                  allowClear
                  options={
                    allLeadUser?.map((item) => ({
                      label: item?.fullName,
                      value: item?.id,
                    })) || []
                  }
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            )}
            <Form.Item
              label="Source"
              name="source"
              rules={[{ required: true, message: "please select source" }]}
            >
              <Select
                placeholder="Select source"
                showSearch
                allowClear
                options={
                  leadSource?.map((item) => ({
                    label: item,
                    value: item,
                  })) || []
                }
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item
              label="Primary address"
              name="primaryAddress"
              rules={[
                { required: true, message: "please enter primary address" },
              ]}
            >
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
            </Form.Item>
            <Form.Item
              label="Lead description"
              name="leadDescription"
              rules={[
                { required: true, message: "please enter lead description" },
              ]}
            >
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default LeadCreateModel;
