import {
  Avatar,
  Button,
  Form,
  Image,
  Input,
  List,
  Modal,
  notification,
  Popconfirm,
  Select,
  Skeleton,
  Typography,
} from "antd";
import React, { useCallback, useState } from "react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteRemarks,
  getAllRemarkAndCommnts,
  updateRemarks,
} from "../../../Toolkit/Slices/LeadSlice";
import { useParams } from "react-router-dom";
const { Text } = Typography;

const LeadComments = ({ list, leadid, addressInfo, industryInfo }) => {
  const { userid } = useParams();
  const dispatch = useDispatch();
  const allComments = useSelector((state) => state.rating.allComments);
  const currentUserRoles = useSelector((state) => state?.auth?.roles);
    const currentUserDetail = useSelector(
      (state) => state.auth.getDepartmentDetail
    );
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [remarkId, setRemarkId] = useState(null);

  const loadMore = (
    <div
      style={{
        textAlign: "center",
        marginTop: 12,
        height: 32,
        lineHeight: "32px",
      }}
    >
      <Button>loading more</Button>
    </div>
  );

  const handleDeleteRemark = useCallback(
    (remarkId) => {
      if (!addressInfo && currentUserDetail?.department === "Sales") {
        notification.warning({ message: "Please update address to proceed !." });
      } else if (!industryInfo && currentUserDetail?.department === "Sales") {
        notification.warning({ message: "Please update industry  to proceed !." });
      } else {
        dispatch(
          deleteRemarks({
            remarkId,
            userid,
            leadid,
          })
        )
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              notification.success({ message: "Remark deleted successfully" });
              dispatch(getAllRemarkAndCommnts(leadid));
            } else {
              notification.error({ message: "Something went wrong !." });
            }
          })
          .catch(() => {
            notification.error({ message: "Something went wrong !." });
          });
      }
    },
    [dispatch, userid, leadid, addressInfo, industryInfo,currentUserDetail]
  );

  const handleEdit = (item) => {
    if (!addressInfo && currentUserDetail?.department === "Sales") {
      notification.warning({ message: "Please update address to proceed !." });
    } else if (!industryInfo && currentUserDetail?.department === "Sales") {
      notification.warning({ message: "Please update industry  to proceed !." });
    } else {
      setRemarkId(item?.id);
      setOpenModal(true);
      form.setFieldsValue({
        message: item?.type === "selected" ? item?.message : "Other",
        textMessage: item?.type === "Other" ? item?.message : "",
      });
    }
  };

  const handleUpdateRemark = useCallback(
    (values) => {
      if (!addressInfo && currentUserDetail?.department === "Sales") {
        notification.warning({ message: "Please update address to proceed !." });
      } else if (!industryInfo && currentUserDetail?.department === "Sales") {
        notification.warning({ message: "Please update industry  to proceed !." });
      } else {
        let obj = {
          remarkId,
          userId: userid,
          message:
            values?.message === "Other" ? values?.textMessage : values?.message,
          type: values?.message === "Other" ? "Other" : "selected",
          leadId: leadid,
        };

        dispatch(updateRemarks(obj))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              notification.success({ message: "Remark updated successfully" });
              dispatch(getAllRemarkAndCommnts(leadid));
              setOpenModal(false);
            } else {
              notification.error({ message: "Something went wrong !." });
            }
          })
          .catch(() => {
            notification.error({ message: "Something went wrong !." });
          });
      }
    },
    [remarkId, userid, leadid, dispatch, addressInfo, industryInfo,currentUserDetail]
  );

  return (
    <>
      <List
        className="demo-loadmore-list custom-list"
        // loading={initLoading}
        style={{ maxHeight: "40vh", overflow: "auto" }}
        size="small"
        itemLayout="vertical"
        // loadMore={loadMore}
        dataSource={list}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                size="small"
                style={{ marginRight: 4 }}
                onClick={() => handleEdit(item)}
              >
                <Icon icon="fluent:edit-24-regular" /> Edit
              </Button>,

              currentUserRoles?.includes("ADMIN") && (
                <Popconfirm
                  title="Delete the remark"
                  description="Are you sure to delete this remark?"
                  icon={
                    <Icon
                      icon="fluent:question-circle-24-regular"
                      color="red"
                    />
                  }
                  onConfirm={() => handleDeleteRemark(item?.id)}
                >
                  <Button size="small" danger>
                    <Icon icon="fluent:delete-24-regular" /> Delete
                  </Button>
                </Popconfirm>
              ),
            ]}
            extra={
              <Image.PreviewGroup
                preview={{
                  onChange: (current, prev) =>
                    console.log(
                      `current index: ${current}, prev index: ${prev}`
                    ),
                }}
              >
                {item?.imageList?.map((item) => (
                  <Image width={40} src={item?.filePath} />
                ))}
              </Image.PreviewGroup>
            }
          >
            <Skeleton avatar title={false} loading={item.loading} active>
              <List.Item.Meta
                avatar={
                  <Avatar size="small">{item?.updatedBy?.fullName?.[0]}</Avatar>
                }
                title={item?.updatedBy?.fullName}
                description={dayjs(item?.latestUpdated).format(
                  "YYYY-MM-DD , hh:mm a"
                )}
              />
              <Text>{item?.message}</Text>
            </Skeleton>
          </List.Item>
        )}
      />
      <Modal
        title="Update comment"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        okText="Submit"
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateRemark}>
          <Form.Item
            label="Select comment"
            name="message"
            rules={[{ required: true, message: "please select the comment" }]}
          >
            <Select
              placeholder="Select comment..."
              showSearch
              allowClear
              options={
                [...allComments, { name: "Other" }]?.map((item) => ({
                  label: item?.name,
                  value: item?.name,
                })) || []
              }
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.message !== currentValues.message
            }
            noStyle
          >
            {({ getFieldValue }) => (
              <>
                {getFieldValue("message") === "Other" && (
                  <Form.Item
                    label="Write comment"
                    name="textMessage"
                    rules={[
                      { required: true, message: "please write the comment" },
                    ]}
                  >
                    <Input.TextArea />
                  </Form.Item>
                )}
              </>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LeadComments;
