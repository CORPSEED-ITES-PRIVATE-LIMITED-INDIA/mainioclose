import React, { useEffect, useState } from "react";
import MainHeading from "../../../components/design/MainHeading";
import CommonTable from "../../../components/CommonTable";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Select,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import {
  createProductSubCategory,
  editProductSubCategory,
  getAllProductSubCategoryListByCategoryId,
} from "../../../Toolkit/Slices/ProductSlice";
import { Link, useParams } from "react-router-dom";

const ProductSubcategory = () => {
  const dispatch = useDispatch();
  const { userid, productId, productCategoryId } = useParams();
  const [form] = Form.useForm();
  const productSubcategoryList = useSelector(
    (state) => state.product.productSubcategoryList
  );
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(getAllProductSubCategoryListByCategoryId(productCategoryId));
  }, [dispatch, productCategoryId]);

  useEffect(() => {
    setFilteredData(productSubcategoryList);
  }, [productSubcategoryList]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = productSubcategoryList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleEdit = (value) => {
    form.setFieldsValue({
      name: value?.name,
      productFees: value?.productFees,
      productGst: value?.productGst,
      roundValue: value?.roundValue,
      productCode: value?.productCode,
    });
    setEditData(value);
    setOpenModal(true);
  };

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "productFees",
      title: "Product fee",
    },
    {
      dataIndex: "productGst",
      title: "Product GST %",
    },
    {
      dataIndex: "productCode",
      title: "HSN code",
    },
    {
      dataIndex: "edit",
      title: "Edit",
      render: (_, records) => (
        <Button size="small" onClick={() => handleEdit(records)}>
          Edit
        </Button>
      ),
    },
  ];

  const handleFinish = (values) => {
    if (editData) {
      dispatch(
        editProductSubCategory({
          ...values,
          productCategoryId: productCategoryId,
          id: editData?.id,
        })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Product category updated successfully",
            });
            setOpenModal(false);
            form.resetFields();
            setEditData(null);
            dispatch(
              getAllProductSubCategoryListByCategoryId(productCategoryId)
            );
          } else {
            notification.error({ message: "Something went wrong!." });
          }
        })
        .catch(() => notification.error({ message: "Something went wrong!." }));
    } else {
      dispatch(
        createProductSubCategory({
          ...values,
          productCategoryId: productCategoryId,
        })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Product category created successfully",
            });
            setOpenModal(false);
            form.resetFields();
            dispatch(
              getAllProductSubCategoryListByCategoryId(productCategoryId)
            );
          } else {
            notification.error({ message: "Something went wrong!." });
          }
        })
        .catch(() => notification.error({ message: "Something went wrong!." }));
    }
  };

  return (
    <>
      <MainHeading data={`Product sub category`} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "12px 0px",
        }}
      >
        <Input
          value={searchText}
          onChange={handleSearch}
          style={{ width: "25%" }}
          placeholder="search"
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
        <Button type="primary" size="small" onClick={() => setOpenModal(true)}>
          Add product subcategory
        </Button>
      </div>
      <CommonTable
        columns={columns}
        data={filteredData}
        scroll={{ y: "72vh" }}
      />

      <Modal
        title="Add product sub category"
        centered
        width={"50%"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: 16,
            }}
          >
            <Form.Item
              label="Product sub category name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "please enter the product sub category name",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Product fee ₹/kg"
              name="productFees"
              rules={[
                {
                  required: true,
                  message: "please enter the product fee",
                },
              ]}
            >
              <InputNumber controls={false} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Product gst %"
              name="productGst"
              rules={[
                {
                  required: true,
                  message: "please enter the product gst %",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Roundoff on product fee"
              name="roundValue"
              rules={[
                {
                  required: true,
                  message: "please select roundoff ",
                },
              ]}
            >
              <Select
                options={[
                  { label: "True", value: true },
                  { label: "False", value: false },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="HSN code"
              name="productCode"
              rules={[
                {
                  required: true,
                  message: "please enter the HSn code",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ProductSubcategory;
