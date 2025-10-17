import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Tabs,
} from "@heroui/react";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useParams } from "react-router-dom";
const routes = [
  "group",
  "ledger",
  "voucher",
  "orgEstimate",
  "dailyBook",
  "bankStatement",
  "paymentRegister",
  "allInvoice",
  "unbill",
  "manageSales",
  "tds",
  "ledgerType",
  "voucherType",
  "statutory",
];

const Organizations = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [selectedKey, setSelectedKey] = useState("");
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
  const handleSelect = (e) => {
    navigate(e);
    setSelectedKey(e);
  };

  const handleSelectChange = (e) => {
    let key = Array.from(e)[0];
    navigate(`/erp/${userId}/accounts/organizations/settings/${key}`);
    setSelectedKey(key);
  };

  return (
    <div className="flex flex-col gap-2">
      {adminRole && (
        <div className="flex justify-between max-w-full overflow-auto">
          <Tabs
            aria-label="Tabs variants"
            variant={"bordered"}
            selectedKey={selectedKey}
            onSelectionChange={handleSelect}
          >
            <Tab key="" title="Organizations" />
            <Tab key="group" title="Group" />
            <Tab key="ledger" title="Ledger" />
            <Tab key="voucher" title="Voucher" />
            <Tab key="dayBook" title="Day book" />
            <Tab key="profitLoss" title="Profit/Loss" />
            <Tab key="cashflow" title="Cashflow" />
            <Tab key="balanceSheet" title="Balance sheet" />
            <Tab key="tds" title="Tds" />
          </Tabs>
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" variant="light" isIconOnly>
                <Settings />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Static Actions"
              selectedKeys={[selectedKey]}
              selectionMode="single"
              onSelectionChange={handleSelectChange}
            >
              <DropdownItem key="ledgerType">Ledger type</DropdownItem>
              <DropdownItem key="voucherType">Voucher type</DropdownItem>
              <DropdownItem key="statutory">Statutory</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )}

      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Organizations;
