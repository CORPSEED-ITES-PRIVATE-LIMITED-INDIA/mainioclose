import React from "react"
import "./SettingMainPage.scss"
import { Link, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import { Layout, Menu, theme } from "antd"
const { Sider, Content } = Layout

const SettingMainPage = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken()
  const currentUserId = useSelector((state) => state?.auth?.currentUser?.id)
  const pathname = window.location.pathname

  const getPathKey = () => {
    const parts = pathname?.split("/")
    const lastWord = parts[parts?.length - 1]
    return lastWord
  }

  const items = [
    {
      key: "leadStatus",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/leadStatus`}
        >
          Lead status
        </Link>
      ),
    },
    {
      key: "category",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/category`}
        >
          Lead category
        </Link>
      ),
    },
    {
      key: "products",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/products`}
        >
          Lead product
        </Link>
      ),
    },
    {
      key: "slug",
      label: (
        <Link className="link-four" to={`/erp/${currentUserId}/setting/erpSetting/slug`}>
          Lead slug
        </Link>
      ),
    },
    {
      key: "urls",
      label: (
        <Link className="link-four" to={`/erp/${currentUserId}/setting/erpSetting/urls`}>
          Lead urls
        </Link>
      ),
    },
    {
      key: "comments",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/comments`}
        >
          Comments
        </Link>
      ),
    },
    {
      key: "desigination",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/desigination`}
        >
          Desigination
        </Link>
      ),
    },
    {
      key: "department",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/department`}
        >
          Department
        </Link>
      ),
    },
    {
      key: "ipaddress",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/ipaddress`}
        >
          Ip address
        </Link>
      ),
    },
    {
      key: "procurement",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/procurement`}
        >
          Procurement
        </Link>
      ),
    },
    {
      key: "clientDesigination",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/clientDesignation`}
        >
          Client designation
        </Link>
      ),
    },
    {
      key: "proposalTemplate",
      label: (
        <Link
          className="link-four"
          to={`/erp/${currentUserId}/setting/erpSetting/proposalTemplate`}
        >
          Proposal template
        </Link>
      ),
    },
  ]

  return (
    <>
      <Layout style={{background:'#fff'}} >
        <Sider
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Menu
            mode="inline"
            items={items}
            defaultSelectedKeys={[getPathKey()]}
            style={{height:'100%'}}
          />
        </Sider>
        <Layout style={{backgroundColor:'#fff'}}>
          <Content
            style={{
              margin: "24px 16px 0",
              backgroundColor:'#fff',
              height:'90vh'
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  )
}

export default SettingMainPage
