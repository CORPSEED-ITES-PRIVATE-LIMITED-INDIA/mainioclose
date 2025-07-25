import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSingleProductByProductId } from "../../toolkit/slices/settingSlice";
import { useParams } from "react-router-dom";
import { Card, CardBody, Tab, Tabs } from "@heroui/react";
import ProductPrice from "./ProductPrice";
import {
  Banknote,
  FileText,
  FlaskConical,
  HandCoins,
  Handshake,
  Paperclip,
  Wrench,
} from "lucide-react";
import ProductDocument from "./ProductDocument";

const ProductDetails = () => {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const details = useSelector((state) => state.setting.singleProductDetail);

  useEffect(() => {
    dispatch(getSingleProductByProductId(productId));
  }, [dispatch, productId]);

  let tabs = [
    {
      id: "price",
      label: (
        <div className="flex items-center space-x-2">
          <Banknote />
          <span>Sales price</span>
        </div>
      ),
      content: <ProductPrice data={details?.productAmount} details={details} />,
    },
    {
      id: "documents",
      label: (
        <div className="flex items-center space-x-2">
          <FileText />
          <span>Documnents checklist</span>
        </div>
      ),
      content: <ProductDocument data={details?.productDoc} details={details} />,
    },
    {
      id: "attacheddocuments",
      label: (
        <div className="flex items-center space-x-2">
          <Paperclip />
          <span>Service documnents</span>
        </div>
      ),
      content: <ProductDocument data={details?.productDoc} details={details} />,
    },
    {
      id: "qualityTat",
      label: (
        <div className="flex items-center space-x-2">
          <FlaskConical />
          <span>Quality TAT</span>
        </div>
      ),
      content: <ProductDocument data={details?.productDoc} details={details} />,
    },
    {
      id: "accountTat",
      label: (
        <div className="flex items-center space-x-2">
          <HandCoins />
          <span>Account TAT</span>
        </div>
      ),
      content: <ProductDocument data={details?.productDoc} details={details} />,
    },
    {
      id: "technicalTat",
      label: (
        <div className="flex items-center space-x-2">
          <Wrench />
          <span>Technical TAT</span>
        </div>
      ),
      content: <ProductDocument data={details?.productDoc} details={details} />,
    },
    {
      id: "crtTat",
      label: (
        <div className="flex items-center space-x-2">
          <Handshake />
          <span>CRT TAT</span>
        </div>
      ),
      content: <ProductDocument data={details?.productDoc} />,
    },
  ];

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 my-2">
        <h1 className="text-xl font-medium">{details?.productName}</h1>
      </div>
      <Tabs aria-label="Dynamic tabs" items={tabs}>
        {(item) => (
          <Tab key={item.id} title={item.label}>
            <Card>
              <CardBody>{item.content}</CardBody>
            </Card>
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default ProductDetails;
