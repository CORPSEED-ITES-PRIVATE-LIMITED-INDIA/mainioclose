import { Drawer } from "antd";
import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import ProductFormDetail from "./ProductFormDetail";
import { useDispatch } from "react-redux";
import { getSingleProductByProductId } from "../../../Toolkit/Slices/ProductSlice";

const ProductDetails = ({ children, data }) => {
  const dispatch = useDispatch();
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleOpenDrawer = useCallback(() => {
    dispatch(getSingleProductByProductId(data?.id));
    setOpenDrawer(true);
  }, [data, dispatch]);

  return (
    <>
      <Link className="link-heading" onClick={handleOpenDrawer}>
        {children}
      </Link>
      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        closeIcon={null}
        width={"80%"}
        style={{ backgroundColor: "#fafafa" }}
      >
        {data?.type === "Service" ? <ProductFormDetail data={data} /> : null}
      </Drawer>
    </>
  );
};

export default ProductDetails;
