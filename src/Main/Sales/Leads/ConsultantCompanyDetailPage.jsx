import { Tabs } from 'antd'
import React from 'react'
import ConsultantCompanyUnitDetail from './ConsultantCompanyUnitDetail';

const ConsultantCompanyDetailPage = () => {
    const items = [
        {
          label: "Company details",
          key: "companyDetails",
          children:<ConsultantCompanyUnitDetail/>,
        },
        // {
        //   label: "Projects",
        //   key: "projects",
        //   children: <NewCompanyProjectDetails/>,
        // },
        // {
        //   label: "Leads",
        //   key: "leads",
        //   children: <NewCompanyLeadsDetail/>,
        // },
      ];
  return (
    <>
    <Tabs items={items} />
  </>
  )
}

export default ConsultantCompanyDetailPage
