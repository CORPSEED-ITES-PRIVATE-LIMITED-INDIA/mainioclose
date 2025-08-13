import { Tab, Tabs } from '@heroui/react'
import CompanyProjects from './CompanyProjects';
import CompanyLeads from './CompanyLeads';
import UnitDetails from './UnitDetails';


const CompanyUnitDetails = () => {
    let tabs = [
    {
      id: "details",
      label: "Details",
      content:<UnitDetails/>
    },
    {
      id: "companyProjects",
      label: "Company projects",
      content:<CompanyProjects/>
    },
    {
      id: "companyLeads",
      label: "Company leads",
      content:<CompanyLeads/>
    }
  ];
  return (
    <Tabs aria-label="Dynamic tabs" items={tabs}>
        {(item) => (
          <Tab key={item.id} title={item.label}>
           {item.content}
          </Tab>
        )}
      </Tabs>
  )
}

export default CompanyUnitDetails