import { Layout, Menu } from "antd";
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";

const { Sider, Content } = Layout;

const MainOrganizationPage = () => {
  const items = [
    {
      key: "organization",
      label: <Link to="organization">Organization</Link>,
    },
    {
      key: "group",
      label: <Link to="group">Group</Link>,
    },
    {
      key: "ledger",
      label: <Link to="ledger">Ledger</Link>,
    },
    {
      key: "voucher",
      label: <Link to="voucher">Voucher</Link>,
    },
    {
      key: "estimate",
      label: <Link to="estimate">Estimate</Link>,
    },
    {
      key: "dailyBook",
      label: <Link to="dailybook">Daily book</Link>,
    },
    {
      key: "bankStatement",
      label: <Link to="bankStatement">Bank statement</Link>,
    },
    {
      key: "paymentRegister",
      label: <Link to="paymentRegister">Payment register</Link>,
    },
    {
      key: "allInvoice",
      label: <Link to="allInvoice">All invoice</Link>,
    },
    {
      key: "unbill",
      label: <Link to="unbill">Unbilled</Link>,
    },
    {
      key: "trailBalance",
      label: <Link to="trailBalance">Trail balance</Link>,
    },
    {
      key: "profitLoss",
      label: <Link to="profitLoss">Profit loss</Link>,
    },
    {
      key: "cashflow",
      label: <Link to="cashflow">Cashflow</Link>,
    },
    // {
    //   key: "manageSales",
    //   label: <Link to="manageSales">Manage sales</Link>,
    // },
    {
      key: "tds",
      label: <Link to="tds">TDS</Link>,
    },
    {
      key: "setting",
      label: <Link to="tds">Setting</Link>,
      children: [
        {
          key: "voucherType",
          label: <Link to="setting/voucherType">Add voucher type</Link>,
        },
        {
          key: "ledgerType",
          // label: <Link to="setting/ledgerType">Ledger type</Link>,
          label: <Link to="setting/addgroup">Add group</Link>,
        },
        {
          key: "statutory",
          label: <Link to="setting/statutory">Statutory</Link>,
        },
      ],
    },
  ];

  const pathname = window.location.pathname;

  const getPathKey = () => {
    const parts = pathname.split("/");
    const lastWord = parts[parts.length - 1];
    return lastWord;
  };

  const getSecondLastKey = () => {
    const parts = pathname.split("/");
    const lastWord = parts[parts.length - 2];
    return lastWord;
  };


  const [openKeys, setOpenKeys] = useState(getSecondLastKey());

  return (
    <Layout>
      <Sider>
        <Menu
          mode="inline"
          defaultSelectedKeys={[getPathKey()]}
          style={{
            height: "94vh",
            borderRight: 0,
          }}
          defaultOpenKeys={[openKeys]}
          items={items}
          onOpenChange={(e) => setOpenKeys(e[e?.length - 1])}
        />
      </Sider>
      <Content style={{ padding: "0px 8px" }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainOrganizationPage;
