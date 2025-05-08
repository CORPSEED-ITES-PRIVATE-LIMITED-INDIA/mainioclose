import React, { useEffect, useState } from "react";
import MainHeading from "../../../components/design/MainHeading";
import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Select,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import CommonTable from "../../../components/CommonTable";
import { Icon } from "@iconify/react";
import ProductDetails from "./ProductDetails";
import "./Product.scss";
import { Link, useParams } from "react-router-dom";
import {
  createProduct,
  getAllProductData,
  getAllProductListByType,
} from "../../../Toolkit/Slices/ProductSlice";
import { deleteProduct } from "../../../Toolkit/Slices/LeadSlice";

const ProductsChange = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const [form] = Form.useForm();
  const productData = useSelector((state) => state.product.productList);
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(getAllProductListByType(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    setFilteredData(productData);
  }, [productData]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = productData?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const ProductCol = [
    { dataIndex: "id", title: "Id", fixed: "left", width: 50 },
    {
      dataIndex: "productName",
      title: "Product name",
      fixed: "left",
      render: (_, records) =>
        records?.type === "Service" ? (
          <ProductDetails data={records}>{records?.productName}</ProductDetails>
        ) : (
          <Link className="link-heading" to={`/erp/${userid}/setting/erpSetting/products/${records.id}/arrangement`}>
            {records?.productName}
          </Link>
        ),
    },
    {
      dataIndex: "type",
      title: "Type",
    },
    {
      dataIndex: "Action",
      title: "Delete",
      render: (_, props) => (
        <Popconfirm
          title="Delete the product"
          description="Are you sure to delete the product"
          onConfirm={() =>
            dispatch(deleteProduct(props.id))
              .then((resp) => {
                if (resp.meta.requestStatus === "fulfilled") {
                  notification.success({
                    message: "Peoduct deleted successfully!.",
                  });
                  dispatch(getAllProductData());
                } else {
                  notification.error({ message: "Something went wrong !." });
                }
              })
              .catch(() =>
                notification.error({ message: "Something went wrong !." })
              )
          }
        >
          <Button size="small" danger>
            <Icon icon="fluent:delete-20-regular" /> Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const handleFinish = (values) => {
    values.userId = userid;
    dispatch(createProduct(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Product created successfully" });
          form.resetFields()
          setOpenModal(false);
        } else {
          notification.error({ message: "Something went wrong!." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong!." }));
  };

  return (
    <div>
      <div className="create-user-box">
        <MainHeading data={`Lead product`} />
        <Button type="primary" size="small" onClick={() => setOpenModal(true)}>
          Add product
        </Button>
      </div>
      <div className="setting-table">
        <div className="flex-verti-center-hori-start mt-2">
          <Input
            value={searchText}
            onChange={handleSearch}
            style={{ width: "20%" }}
            placeholder="search"
            prefix={<Icon icon="fluent:search-24-regular" />}
          />
          <Select
            value={filter}
            style={{ width: "15%" }}
            onChange={(e) => setFilter(e)}
            options={[
              { label: "All", value: "all" },
              { label: "Product", value: "Product" },
              { label: "Service", value: "Service" },
            ]}
          />
        </div>

        <CommonTable
          data={filteredData}
          columns={ProductCol}
          scroll={{ y: "72vh" }}
        />
      </div>

      <Modal
        title="Add product"
        centered
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            label="Enter product name"
            name="name"
            rules={[
              { required: true, message: "please enter the product name" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "please select type" }]}
          >
            <Select
              options={[
                { label: "Product", value: "Product" },
                { label: "Service", value: "Service" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsChange;
