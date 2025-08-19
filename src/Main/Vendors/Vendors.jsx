import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Select,
  Timeline,
  Typography,
  Upload,
} from "antd"
import React, { useCallback, useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { useDispatch, useSelector } from "react-redux"
import {
  addVendorsDetail,
  allVendorsCategory,
  getSingleCategoryDataById,
  getVendorDetailList,
} from "../../Toolkit/Slices/LeadSlice"
import { useParams } from "react-router-dom"
import dayjs from "dayjs"
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../components/Constants"
const { Text, Paragraph } = Typography

const VendorForm = ({ leadId, userId }) => {
  const vendorsCategoryList = useSelector(
    (state) => state.leads.vendorsCategoryList
  )
  const singleCategoryDetail = useSelector(
    (state) => state.leads.singleCategoryDetail
  )
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    dispatch(allVendorsCategory())
  }, [dispatch])

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  const handleFinish = useCallback(
    (data) => {
      data.salesAttachmentReferencePath =
        data?.salesAttachmentReferencePath?.map((item) => item?.response)
      let temData = {
        leadId,
        userId,
        data,
      }
      dispatch(addVendorsDetail(temData))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Vendor's details added successfully",
            })
            setOpenModal(false)
            dispatch(getVendorDetailList({ leadId, userid: userId }))
            form.resetFields()
          } else {
            notification.error({ message: "Something went wrong !." })
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong !." })
        })
    },
    [dispatch, leadId, userId, form]
  )

  return (
    <>
      <Button type="primary" onClick={() => setOpenModal(true)}>
        Add vendor's request
      </Button>
      <Modal
        title="Client details"
        open={openModal}
        centered
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form
          layout="vertical"
          size="small"
          form={form}
          onFinish={handleFinish}
          style={{ maxHeight: "80vh", overflow: "auto" }}
        >
          <Form.Item
            label="Client name"
            name="clientName"
            rules={[
              { required: true, message: "please enter the person name" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="clientMailId"
            rules={[
              {
                required: true,
                type: "email",
                message: "please enter email address",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Company name"
            name="companyName"
            rules={[{ required: true, message: "please enter company name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Select category"
            name="vendorCategoryId"
            rules={[{ required: true, message: "please select category" }]}
          >
            <Select
              options={vendorsCategoryList?.map((item) => ({
                label: item?.vendorCategoryName,
                value: item?.id,
              }))}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(e) => dispatch(getSingleCategoryDataById(e))}
            />
          </Form.Item>

          <Form.Item
            label="Select sub category"
            name="subVendorCategoryId"
            rules={[{ required: true, message: "please select sub category" }]}
          >
            <Select
              options={singleCategoryDetail?.subCategories?.map((item) => ({
                label: item?.subCategoryName,
                value: item?.subCategoryId,
              }))}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Reference attachement"
            name="salesAttachmentReferencePath"
            getValueFromEvent={normFile}
            valuePropName="fileList"
            rules={[{ required: true, message: "please upload the document" }]}
          >
            <Upload
              action="/leadService/api/v1/upload/uploadimageToFileSystem"
              listType="text"
              multiple={true}
            >
              <Button size="small">
                <Icon icon="fluent:arrow-upload-20-filled" />
                Upload
              </Button>
            </Upload> 
          </Form.Item>

          <Form.Item
            label="Contact number"
            name="clientMobileNumber"
            rules={[{ required: true, message: "please give contact number" }]}
          >
            <Input maxLength={10} />
          </Form.Item>

          <Form.Item label="Client budget price" name="clientBudgetPrice">
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "please enter description" }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const Vendors = ({ leadId }) => {
  const { userid } = useParams()
  const vendorList = useSelector((state) => state.leads.vendorsList)
  const [vendor, setVendor] = useState([])
  const [vendorDetail, setVendorDetail] = useState({})
  const [openDocModal, setOpenDocModal] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (vendorList?.length > 0) {
      setVendor(vendorList?.[0]?.updateHistory)
      setVendorDetail(vendorList?.[0])
    } else {
      setVendor([])
      setVendorDetail({})
    }
  }, [vendorList])

  const handleSelectVendor = useCallback(
    (e) => {
      let result = vendorList?.find((item) => item?.id === e)
      setVendorDetail(result)
      setVendor(result?.updateHistory)
    },
    [vendorList]
  )

  
  return (
    <>
      <Flex justify="space-between" align="center">
        <Select
          showSearch
          size="small"
          value={vendorDetail?.id}
          placeholder="select vendor request"
          style={{ width: "25%" }}
          options={
            vendorList?.length > 0
              ? vendorList?.map((item) => ({
                  label: `${item?.contactPersonName}${
                    item?.contactNumber ? ` || ${item?.contactNumber}` : ""
                  }`,
                  value: item?.id,
                }))
              : []
          }
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          onChange={handleSelectVendor}
        />
        <div className="filter-box">
          <VendorForm leadId={leadId} userId={userid} />
        </div>
      </Flex>

      <div style={{ marginTop: "12px" }}>
        <Flex justify="space-between" style={{ margin: "8px 0px" }}>
          <Text className="heading-text">Client request status</Text>
        </Flex>
        <Row>
          <Col span={6}>
            <Flex style={{ width: "100%" }} gap={8} vertical>
              {vendorDetail?.updatedDate && (
                <Text className="heading-text" type="secondary">
                  {" "}
                  Client's detail{" "}
                  {dayjs(vendorDetail?.updatedDate).format(
                    "YYYY-MM-DD , hh:mm a"
                  )}{" "}
                </Text>
              )}
              {Object.keys(vendorDetail)?.length > 0 && (
                <Flex vertical gap={12}>
                  {vendorDetail?.contactPersonName && (
                    <Flex gap={6}>
                      <Icon
                        icon="fluent:person-24-regular"
                        height={BTN_ICON_HEIGHT}
                        width={BTN_ICON_WIDTH}
                      />
                      <Text>{vendorDetail?.contactPersonName}</Text>
                    </Flex>
                  )}

                  {vendorDetail?.clientEmailId && (
                    <Flex gap={6}>
                      <Icon
                        icon="fluent:mail-24-regular"
                        height={BTN_ICON_HEIGHT}
                        width={BTN_ICON_WIDTH}
                      />
                      <Text>{vendorDetail?.clientEmailId}</Text>
                    </Flex>
                  )}

                  {vendorDetail?.contactNumber && (
                    <Flex gap={6}>
                      <Icon
                        icon="fluent:call-24-regular"
                        height={BTN_ICON_HEIGHT}
                        width={BTN_ICON_WIDTH}
                      />
                      <Text>{vendorDetail?.contactNumber}</Text>
                    </Flex>
                  )}

                  {vendorDetail?.clientCompanyName && (
                    <Flex gap={6}>
                      <Icon
                        icon="fluent:building-people-24-regular"
                        height={BTN_ICON_HEIGHT}
                        width={BTN_ICON_WIDTH}
                      />
                      <Text>{vendorDetail?.clientCompanyName}</Text>
                    </Flex>
                  )}

                  {vendorDetail?.budgetPrice && (
                    <Flex gap={6}>
                      <Icon
                        icon="fluent:money-24-regular"
                        height={BTN_ICON_HEIGHT}
                        width={BTN_ICON_WIDTH}
                      />
                      <Text>{vendorDetail?.budgetPrice}</Text>
                    </Flex>
                  )}

                  {vendorDetail?.vendorCategoryName && (
                    <Flex gap={6}>
                      <Icon
                        icon="fluent:person-settings-20-regular"
                        height={BTN_ICON_HEIGHT}
                        width={BTN_ICON_WIDTH}
                      />
                      <Text>
                        Category name : {vendorDetail?.vendorCategoryName}
                      </Text>
                    </Flex>
                  )}

                  {vendorDetail?.vendorSubCategoryName && (
                    <Flex gap={6}>
                      <Icon
                        icon="fluent:person-settings-20-regular"
                        height={BTN_ICON_HEIGHT}
                        width={BTN_ICON_WIDTH}
                      />
                      <Text>
                        Sub category name :{" "}
                        {vendorDetail?.vendorSubCategoryName}
                      </Text>
                    </Flex>
                  )}

                  {vendorDetail?.requirementDescription && (
                    <Flex gap={6}>
                      <Flex>
                        <Icon
                          icon="fluent:document-bullet-list-24-regular"
                          height={BTN_ICON_HEIGHT}
                          width={BTN_ICON_WIDTH}
                        />
                      </Flex>
                      <Paragraph>
                        {vendorDetail?.requirementDescription}
                      </Paragraph>
                    </Flex>
                  )}
                </Flex>
              )}

              <Flex vertical gap={8}>
                {vendorDetail?.vendorReferenceFile && (
                  <>
                    <Text className="heading-text">Attachements</Text>
                    <Button onClick={() => setOpenDocModal(true)} size="small">
                      View document
                    </Button>
                  </>
                )}
                <Modal
                  title="Documents"
                  width={800}
                  centered
                  open={openDocModal}
                  onClose={() => setOpenDocModal(false)}
                  onCancel={() => setOpenDocModal(false)}
                  footer={null}
                >
                  <iframe
                    title=""
                    src={vendorDetail?.salesAttachmentImage?.[index]}
                    height={500}
                    width={"100%"}
                  />
                  <Flex justify="space-between">
                    <Button
                      size="small"
                      disabled={index === 0}
                      onClick={() => setIndex((prev) => prev - 1)}
                    >
                      Prev
                    </Button>
                    <Button
                      size="small"
                      disabled={
                        index >= vendorDetail?.salesAttachmentImage?.length
                      }
                      onClick={() => setIndex((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </Flex>
                </Modal>
              </Flex>
            </Flex>
          </Col>
          <Col span={18}>
            <Timeline
              mode="left"
              items={
                vendor?.length > 0
                  ? vendor?.map((item) => ({
                      color:
                        item?.requestStatus === "Unavailable"
                          ? "red"
                          : item?.requestStatus === "Finished"
                          ? "green"
                          : item?.requestStatus === "Processing"
                          ? "orange"
                          : "blue",
                      dot:
                        item?.requestStatus === "Processing" ? (
                          <Icon icon="fluent:clock-24-regular" color="orange" />
                        ) : item?.requestStatus === "Finished" ? (
                          <Icon
                            icon="fluent:checkmark-24-filled"
                            color="green"
                          />
                        ) : (
                          ""
                        ),
                      label: (
                        <Flex vertical gap="2" justify="flex-end">
                          <Text>{item?.requestStatus}</Text>
                          <Text type="secondary">
                            Assigned to : {vendorDetail?.assigneeName}
                          </Text>
                          <Text type="secondary">
                            {dayjs(item?.updateDate).format(
                              "YYYY-MM-DD , hh:mm a"
                            )}
                          </Text>
                        </Flex>
                      ),
                      children: (
                        <Flex vertical gap={2}>
                          {/* {item?.externalVendorPrice && (
                            <Text strong>
                              Price give by vendor : {item?.externalVendorPrice}
                            </Text>
                          )}

                          {item?.internalVendorPrices && (
                            <Text strong>
                              Price given to vendor :{" "}
                              {item?.internalVendorPrices}
                            </Text>
                          )} */}

                          {item?.quotationAmount && (
                            <Text strong>
                              {" "}
                              Quotation amount : {item?.quotationAmount}
                            </Text>
                          )}
                          <Text>{item?.updateDescription}</Text>
                        </Flex>
                      ),
                    }))
                  : []
              }
            />
          </Col>
        </Row>
      </div>
    </>
  )
}

export default Vendors
