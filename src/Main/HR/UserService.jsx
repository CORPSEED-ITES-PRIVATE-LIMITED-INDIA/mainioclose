import React, { useCallback, useEffect, useState } from "react"
import TableOutlet from "../../components/design/TableOutlet"
import MainHeading from "../../components/design/MainHeading"
import { useDispatch, useSelector } from "react-redux"
import TableScalaton from "../../components/TableScalaton"
import SomethingWrong from "../../components/usefulThings/SomethingWrong"
import CreateRatingModel from "../../Model/CreateRatingModel"
import CommonTable from "../../components/CommonTable"
import OverFlowText from "../../components/OverFlowText"
import { Icon } from "@iconify/react"
import { Button, Flex, Form, Input, Modal, Select, Typography, notification } from "antd"
import { getAllUrlList } from "../../Toolkit/Slices/LeadUrlSlice"
import { addMultiuser } from "../../Toolkit/Slices/RatingSlice"
const { Text } = Typography

const UserService = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const { allLeadUrlLoading, allLeadUrlError, allUrlList } = useSelector(
    (prev) => prev?.leadurls
  )
  const allLeadUrl = useSelector((state) => state.leadurls.allUrlList)
  const { allUsers } = useSelector((prev) => prev?.user)
  const allStars = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
  ]
  const [openModal, setOpenModal] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filteredData, setFilteredData] = useState([])

  useEffect(() => {
    dispatch(getAllUrlList())
  }, [dispatch])

  useEffect(() => {
    setFilteredData(allUrlList)
  }, [allUrlList])



  const handleSearch = (e) => {
    const value = e.target.value.trim()
    setSearchText(value)
    const filtered = allUrlList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    )
    setFilteredData(filtered)
  }

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 100
    },
    {
      dataIndex: "urlsName",
      title: "Url's name",
      render: (_, props) => (
        <OverFlowText linkText={true} to={`${props?.id}`}>
          {props?.urlsName}
        </OverFlowText>
      ),
    },
    {
      dataIndex: "quality",
      title: "Quality",
      width: 100,
      render: (_, data) => <Text>{data?.quality ? "True" : "False"}</Text>,
    },
  ]



  const handleFinish = useCallback(
    (values) => {

      dispatch(addMultiuser(values))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Rating updated successfully .",
            })
            dispatch(getAllUrlList())
            form.resetFields()
            setOpenModal(false)
          } else if (response.meta.requestStatus === "rejected") {
            notification.error({
              message: "Either user is already persent or empty",
            })
            setOpenModal(false)
          }
        })
        .catch((err) => {
          notification.error({ message: "Something went wrong !." })
          setOpenModal(false)
        })
    },
    [dispatch, form]
  )

  return (
    <TableOutlet>
      <div className="create-user-box">
        <MainHeading data={"All service"} />

        <Flex gap={8}>
          <Button onClick={() => setOpenModal(true)}>
            Add multiservice
          </Button>
          <CreateRatingModel />
        </Flex>
      </div>

      <div>
        <Input
          placeholder="search"
          value={searchText}
          onChange={handleSearch}
          style={{ width: "250px" }}
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
        {allLeadUrlLoading && <TableScalaton />}
        {allLeadUrlError && <SomethingWrong />}
        {allUrlList && !allLeadUrlLoading && !allLeadUrlError && (
          <CommonTable
            data={filteredData}
            columns={columns}
            scroll={{ y: 450 }}
            rowSelection={true}
          />
        )}
      </div>
      <Modal
        title='Add multiservice'
        open={openModal} 
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        okText='Submit'
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Select users"
            name="ratingsUser"
            rules={[{ required: true, message: "please select users" }]}
          >
            <Select
              showSearch
              allowClear
              options={
                allUsers?.length > 0
                  ? allUsers?.map((item) => ({
                    label: item?.fullName,
                    value: item?.id,
                  }))
                  : []
              }
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Number of rating"
            name="rating"
            rules={[{ required: true, message: "please select the rating" }]}
          >
            <Select
              showSearch
              allowClear
              options={allStars}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Select url"
            name="urlsManagmentId"
            rules={[{ required: true, message: "please select urls" }]}
          >
            <Select
              showSearch
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              options={
                allLeadUrl?.length > 0
                  ? allLeadUrl?.map((item) => ({
                    label: item?.urlsName,
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
    </TableOutlet>
  )
}

export default UserService
