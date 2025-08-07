import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import MainPage from "./Main/MainPage";
import DashBoard from "./Main/DashBoard/DashBoard";
import HRMod from "./Main/HR/HRMod";
import SalesMod from "./Main/Sales/SalesMod";
import InboxPage from "./Main/Sales/Inbox/InboxPage";
import ContactModule from "./Main/Sales/Contacts/ContactModule";
import Estimate from "./Main/Sales/Estimate/Estimate";
import LeadsModule from "./Main/Sales/Leads/LeadsModule";
import Opportunities from "./Main/Sales/Opportunities/Opportunities";
import OrdersModule from "./Main/Sales/Orders/OrdersModule";
import Login from "./Login/Login";
import SignUp from "./Login/SignUp";
import LeadDetailsPage from "./Main/Sales/Inbox/LeadDetailsPage";
import MainLoginRouter from "./Login/MainLoginRouter";
import OtpPage from "./Login/OtpPage";
import ForgetPassword from "./Login/ForgetPassword";
import ChangePassword from "./Login/ChangePassword";
import ForgetOtpPage from "./Login/ForgetOtpPage";
import DisplayDashboardUser from "./Main/DashBoard/DisplayDashboardUser";
import DisplayUserTwo from "./Main/DashBoard/DisplayUserTwo";
import SetNewPasswordPage from "./Login/SetNewPasswordPage";
import TableScalaton from "./components/TableScalaton";
import LeadHistory from "./Main/Sales/Leads/LeadHistory";
import NewGetFile from "./Routes/NewGetFile";
import PaswordUpdateMessage from "./Login/PaswordUpdateMessage";
import ComingSoonPage from "./Home/ComingSoonPage";
import SettingMainPage from "./Main/Setting/SettingMainPage";
import LeadStatusPage from "./Main/Setting/LeadStatus/LeadStatusPage";
import ProductsChange from "./Main/Setting/Products/ProductsChange";
import NotFoundPage from "./components/NotFoundPage";
import LeadCategory from "./Main/Setting/Category/LeadCategory";
import AllNotificationPage from "./Main/Sales/Leads/AllNotificationPage";
import AllDeactivateUser from "./Main/DashBoard/AllDeactivateUser";
import { useSelector } from "react-redux";
import GetAllTaskList from "./Main/Sales/Leads/GetAllTaskList";
import AllTickets from "./Main/DashBoard/AllTickets";
import HrUserList from "./Main/HR/HrUserList";
import AllManagerApprovals from "./Main/DashBoard/AllManagerApprovals";
import HRApprovalList from "./Main/HR/HRApprovalList";
import UserRating from "./Main/HR/UserRating";
import SlugCreate from "./Main/Setting/slug/SlugCreate";
import UrlsPage from "./Main/Setting/urls/UrlsPage";
import SingleUserHistory from "./Main/DashBoard/SingleUserHistory";
import ProjectPage from "./Main/Sales/Project/ProjectPage";
import UserService from "./Main/HR/UserService";
import Compliances from "./Main/Compliance/Compliances";
import QualityModule from "./Main/Quality/QualityModule";
import IVR from "./Main/Quality/IVR";
import Accounts from "./Main/Accounts/Accounts";
import { ConfigProvider } from "antd";
import Comments from "./Main/Setting/Comments/Comments";
import { lazy, Suspense } from "react";
import Desigination from "./Main/Setting/Desigination/Desigination";
import Department from "./Main/Setting/Department/Department";
import CompanyForm from "./Main/Accounts/CompanyForm";
import CompanyPageLayout from "./Main/Sales/company/CompanyPageLayout";
import Industry from "./Main/Industry/Industry";
import SubIndustry from "./Main/Industry/SubIndustry/SubIndustry";
import SubsubIndustry from "./Main/Industry/SubsubIndustry/SubsubIndustry";
import IndustryData from "./Main/Industry/IndustryData/IndustryData";
import Industries from "./Main/Industry/Industries/Industries";
import HomePageFile from "./Home/HomePageFile";
import LandingPage from "./Home/LandingPage";
import IpAddress from "./Main/Setting/IpAddress/IpAddress";
import VendorsList from "./Main/Vendors/VendorsList";
import Procurement from "./Main/Vendors/Procurement";
import MainCompanyFormPage from "./Main/Accounts/MainCompanyFormPage";
import VendorsRequestList from "./Main/Sales/Leads/VendorsRequestList";
import ClientDesigination from "./Main/Setting/ClientDesiginations/ClientDesigination";
import MainComanyModule from "./Main/Sales/company/MainComanyModule";
import GraphMainPage from "./Main/GraphDashboard/GraphMainPage";
import EstimatePage from "./Main/Sales/Leads/EstimatePage";
import ProposalsPage from "./Main/Sales/Leads/ProposalsPage";
import AccountSettingPage from "./Main/AccountSetting/AccountSettingPage";
import VoucherTypePage from "./Main/AccountSetting/VoucherType/VoucherTypePage";
import LedgerTypePage from "./Main/AccountSetting/LedgerType/LedgerTypePage";
import Statutory from "./Main/AccountSetting/Statutory/Statutory";
import Ledger from "./Main/Accounts/Ledger/Leadger";
import Voucher from "./Main/Accounts/Voucher/Voucher";
import Organizations from "./Main/Accounts/Organization/Organizations";
import DailyBook from "./Main/Accounts/DailyBook/DailyBook";
import BankStatement from "./Main/Accounts/BankStatements/BankStatement";
import PaymentRegister from "./Main/Accounts/PaymentRegister/PaymentRegister";
import TDS from "./Main/Accounts/TDS/TDS";
import Group from "./Main/Accounts/Organization/Group/Group";
import MainOrganizationPage from "./Main/Accounts/Organization/MainOrganizationPage";
import SettingsPage from "./Main/Accounts/Organization/Settings/SettingsPage";
import GroupLedger from "./Main/Accounts/Organization/Group/GroupLedger";
import MainGroupPage from "./Main/Accounts/Organization/Group/MainGroupPage";
import MainGroupLedgerPage from "./Main/Accounts/Organization/Group/MainGroupLedgerPage";
import Groupvoucher from "./Main/Accounts/Organization/Group/Groupvoucher";
import AccountEstimate from "./Main/Accounts/estimate/AccountEstimate";
import AllInvoice from "./Main/Accounts/AllInvoice";
import ManageSales from "./Main/Accounts/ManageSales";
import NewCompany from "./Main/Sales/Leads/NewCompany";
import CompanyDetailPage from "./Main/Sales/Leads/CompanyDetailPage";
import NewCompanyUnits from "./Main/Sales/Leads/NewCompanyUnits";
import CompanySearch from "./Main/Accounts/CompanySearch";
import NewCompaniesDetailedLayout from "./Main/Sales/Leads/NewCompaniesDetailedLayout";
import ConsultantCompanyPage from "./Main/Sales/Leads/ConsultantCompanyPage";
import ConsultantCompanyGStPage from "./Main/Sales/Leads/ConsultantCompanyGStPage";
import ConsultantCompanyUnitsPage from "./Main/Sales/Leads/ConsultantCompanyUnitsPage";
import CompanyApproval from "./Main/Accounts/CompanyApproval";
import ServingCompanyPage from "./Main/Sales/Leads/ServingCompanyPage";
import PaymentApproval from "./Main/Accounts/PaymentApproval";
import EstimateApproval from "./Main/HR/EstimateApproval";
import DiscountedEstimates from "./Main/Sales/DiscountedEstimates";
import BusinessArrangement from "./Main/Setting/Products/BusinessArrangement";
import ProductCategory from "./Main/Setting/Products/ProductCategory";
import ProductSubcategory from "./Main/Setting/Products/ProductSubcategory";
import ProposalTemplate from "./Main/Setting/ProposalTemplate";
import AutoHistory from "./Main/Sales/auto/AutoHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import EstimatePreviewPage from "./components/EstimatePreviewPage";
import LedgerDetail from "./Main/Accounts/Ledger/LedgerDetail";
import AutomationLeads from "./Main/Sales/Leads/AutomationLeads";
import QualityLeadReport from "./Main/Sales/Leads/QualityLeadReport";

const SpinLoading = lazy(() => import("./components/SpinLoading"));

function App() {
  const authStatus = useSelector((state) => state.auth.isAuth);
  const userData = JSON.parse(localStorage.getItem("userDetail"));

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 6,
          colorText: "#2e2e2e",
          colorTextHeading: "#2e2e2e",
          colorTextDisabled: "#8c8c8c",
          colorTextPlaceholder: "#8c8c8c",
        },
        components: {
          Card: {
            actionsLiMargin: 6,
            paddingLG: 12,
            padding: 12,
            paddingSM: 12,
          },
          Typography: {
            fontSize: 13,
            margin: 0,
          },
          Button: {
            contentFontSize: 13,
            contentFontSizeSM: 13,
            borderRadius: 4,
            borderRadiusLG: 4,
            borderRadiusSM: 4,
            controlHeightSM: 28,
            paddingInlineSM: 10,
          },
          Popconfirm: {
            fontSize: 13,
          },
          Select: {
            fontSize: 13,
            contentFontSize: 11,
            contentFontSizeSM: 11,
            optionFontSize: 12,
            optionHeight: 28,
            controlHeightSM: 28,
            borderRadius: 4,
            borderRadiusSM: 4,
            borderRadiusLG: 4,
            fontSizeLG: 14,
          },
          Input: {
            borderRadius: 4,
            borderRadiusSM: 4,
            borderRadiusLG: 4,
            controlHeightSM: 28,
          },
          InputNumber: {
            borderRadius: 4,
            borderRadiusSM: 4,
            borderRadiusLG: 4,
            controlHeightSM: 28,
          },
          Divider: {
            colorSplit: "#D3D3D3",
            margin: 4,
          },
          Table: {
            colorText: "#2e2e2e",
            headerColor: "#222222",
            fontWeightStrong: 600,
            cellFontSize: 13,
            cellFontSizeMD: 13,
            cellFontSizeSM: 13,
            cellPaddingBlock: 8,
            cellPaddingInline: 8,
            cellPaddingBlockMD: 8,
          },
          Tabs: {
            fontSize: 14,
            fontSizeSM: 14,
            fontWeightStrong: 600,
            cardPaddingSM: "5px 12px",
            horizontalMargin: "0px 0px 4px 0px",
          },
          Collapse: {
            headerPadding: "6px 8px",
          },
          Menu: {
            horizontalLineHeight: 38,
            itemHeight: 32,
            itemPaddingInline: 12,
            groupTitleFontSize: 15,
            fontSize: 15,
            fontSizeLG: 15,
            borderRadius: 4,
            borderRadiusSM: 4,
            borderRadiusLG: 4,
          },
          Form: {
            fontSize: 13,
            fontSizeLG: 14,
          },
          List: {
            descriptionFontSize: 13,
            fontSize: 13,
            fontSizeSM: 13,
            titleMarginBottom: 0,
          },
          Timeline: {
            fontSize: 13,
            itemPaddingBottom: 78,
          },
          Pagination: {
            fontSizeSM: 13,
            itemSizeSM: 22,
          },
          DatePicker: {
            controlHeightSM: 28,
            contentFontSizeSM: 13,
            borderRadius: 4,
            borderRadiusSM: 4,
            borderRadiusLG: 5,
          },
        },
      }}
    >
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/newfile" element={<NewGetFile />}></Route>
            <Route path="/:leadId/estimate-preview" element={<EstimatePreviewPage />}></Route>
            <Route path="*" element={<NotFoundPage />} />

            {/* <Route path="/" element={<HomePage />}>
              <Route path="/" element={<FrontMainPage />} />
              <Route path="/contact" element={<div>Contact</div>} />
            </Route> */}

            <Route path="/" element={<HomePageFile />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/contact" element={<div>Contact</div>} />
            </Route>

            <Route path="/erp" element={<MainLoginRouter />}>
              <Route path="login" element={<Login />} />
              <Route
                path="setpassword/:userid/thankyou"
                element={<PaswordUpdateMessage />}
              />
              <Route path="signup" element={<SignUp />} />
              <Route path="otp" element={<OtpPage />} />
              <Route path="forgetotp" element={<ForgetOtpPage />} />
              <Route path="forgetpassword" element={<ForgetPassword />} />.
              <Route path="change" element={<ChangePassword />} />
              <Route
                path="setpassword/:userid"
                element={<SetNewPasswordPage />}
              />
            </Route>

            <Route
              path="/erp"
              element={userData ? <MainPage /> : <Navigate to="/erp/login" />}
            >
              <Route
                path=":userid/dashboard"
                element={
                  <ProtectedRoute>
                    <DashBoard />
                  </ProtectedRoute> 
                }
              >
                <Route
                  path="users"
                  element={
                    <ProtectedRoute>
                      <DisplayDashboardUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users/:leadid/history"
                  element={
                    <ProtectedRoute>
                      <SingleUserHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tickets"
                  element={
                    <ProtectedRoute>
                      <AllTickets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="manager"
                  element={
                    <ProtectedRoute>
                      <AllManagerApprovals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="muiuser"
                  element={
                    <ProtectedRoute>
                      <DisplayUserTwo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users/deactivateUser"
                  element={
                    <ProtectedRoute>
                      <AllDeactivateUser />
                    </ProtectedRoute>
                  }
                />
                {/* <Route path="records" element={<MainGraphPage />} /> */}
                <Route
                  path="records"
                  element={
                    <ProtectedRoute>
                      <GraphMainPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* hr module routes */}
              <Route
                path="/erp/:userid/hr"
                element={
                  <ProtectedRoute>
                    <HRMod />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="userlist"
                  element={
                    <ProtectedRoute>
                      <HrUserList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="approveUser"
                  element={
                    <ProtectedRoute>
                      <HRApprovalList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="userservice"
                  element={
                    <ProtectedRoute>
                      <UserService />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="estimateApproval"
                  element={
                    <ProtectedRoute>
                      <EstimateApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="userservice/:serviceid"
                  element={
                    <ProtectedRoute>
                      <UserRating />
                    </ProtectedRoute>
                  }
                />
                <Route path="hrlinkfour" element={<div>hrlinkfour</div>} />
                <Route path="hrlinkfive" element={<div>hrlinkfive</div>} />
                <Route path="hrlinksix" element={<div>hrlinksix</div>} />
              </Route>
              {/* end */}
              <Route
                path="/erp/:userid/compliance"
                element={
                  <ProtectedRoute>
                    <Compliances />
                  </ProtectedRoute>
                }
              />
              {/* sales module routes */}
              <Route
                path="/erp/:userid/sales"
                element={
                  <ProtectedRoute>
                    <SalesMod />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="inbox"
                  element={
                    <ProtectedRoute>
                      <InboxPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="scalaton" element={<TableScalaton />} />
                <Route
                  path="oppurtities"
                  element={
                    <ProtectedRoute>
                      <Opportunities />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="company"
                  element={
                    <ProtectedRoute>
                      <MainComanyModule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="newcompanies"
                  element={
                    <ProtectedRoute>
                      <NewCompany />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="discountedEstimates"
                  element={
                    <ProtectedRoute>
                      <DiscountedEstimates />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="servingcompanies"
                  element={
                    <ProtectedRoute>
                      <ServingCompanyPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="newcompanies/:companyId/details"
                  element={
                    <ProtectedRoute>
                      <NewCompaniesDetailedLayout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="newcompanies/:companyId/newCompaniesUnit"
                  element={
                    <ProtectedRoute>
                      <CompanyDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="newcompanies/:companyId/newConsultantCompanies"
                  element={
                    <ProtectedRoute>
                      <ConsultantCompanyPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="newcompanies/:companyId/newConsultantCompanies/:consultCompanyId/:companyType/consultantGst"
                  element={
                    <ProtectedRoute>
                      <ConsultantCompanyGStPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="newcompanies/:companyId/newConsultantCompanies/:consultCompanyId/consultantGst/:consultantParentCompanyId/:state/:consultCompanyType/consultantCompanyUnits"
                  element={
                    <ProtectedRoute>
                      <ConsultantCompanyUnitsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="newcompanies/:companyId/newCompaniesUnit/:state/:stateId/companyUnit"
                  element={
                    <ProtectedRoute>
                      <NewCompanyUnits />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="project"
                  element={
                    <ProtectedRoute>
                      <ProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="vendors-request"
                  element={
                    <ProtectedRoute>
                      <VendorsRequestList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="lead-form"
                  element={
                    <ProtectedRoute>
                      <CompanyForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="estimate"
                  element={
                    <ProtectedRoute>
                      <EstimatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="proposal"
                  element={
                    <ProtectedRoute>
                      <ProposalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="autoHistory"
                  element={
                    <ProtectedRoute>
                      <AutoHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="automationStatus"
                  element={
                    <ProtectedRoute>
                      <AutomationLeads />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="qualityReport"
                  element={
                    <ProtectedRoute>
                      <QualityLeadReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="paymentsRegister"
                  element={
                    <ProtectedRoute>
                      <PaymentRegister />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="company/:companyId/details"
                  element={
                    <ProtectedRoute>
                      <CompanyPageLayout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="estimate"
                  element={
                    <ProtectedRoute>
                      <Estimate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute>
                      <OrdersModule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="leads/:leadid"
                  element={
                    <ProtectedRoute>
                      <LeadDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="contacts"
                  element={
                    <ProtectedRoute>
                      <ContactModule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="leads/:leadid/history"
                  element={
                    <ProtectedRoute>
                      <LeadHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="leads"
                  element={
                    <ProtectedRoute>
                      <LeadsModule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="leads/allTask"
                  element={
                    <ProtectedRoute>
                      <GetAllTaskList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="leads/notification"
                  element={
                    <ProtectedRoute>
                      <AllNotificationPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              {/* end */}
              {/* accounts module routes */}
              <Route
                path="/erp/:userid/account"
                element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                }
              >
                {/* <Route path="accountlist" element={<AccountsList />} /> */}
                {/* <Route path="companyForm" element={<CompanyForm />} /> */}
                <Route
                  path="companyForm"
                  element={
                    <ProtectedRoute>
                      <MainCompanyFormPage role={"sales"} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="companySearch"
                  element={
                    <ProtectedRoute>
                      <CompanySearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="companyApproval"
                  element={
                    <ProtectedRoute>
                      <CompanyApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="paymentApproval"
                  element={
                    <ProtectedRoute>
                      <PaymentApproval />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="organizations"
                  element={
                    <ProtectedRoute>
                      <MainOrganizationPage />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    index
                    element={
                      <ProtectedRoute>
                        <Organizations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="organization"
                    element={
                      <ProtectedRoute>
                        <Organizations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="ledger"
                    element={
                      <ProtectedRoute>
                        <Ledger />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="ledger/:ledgerId/detail"
                    element={
                      <ProtectedRoute>
                        <LedgerDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="voucher"
                    element={
                      <ProtectedRoute>
                        <Voucher />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="estimate"
                    element={
                      <ProtectedRoute>
                        <AccountEstimate />
                      </ProtectedRoute>
                    }
                  />

                  {/* Group Routes */}
                  <Route
                    path="group"
                    element={
                      <ProtectedRoute>
                        <MainGroupPage />
                      </ProtectedRoute>
                    }
                  >
                    <Route
                      index
                      element={
                        <ProtectedRoute>
                          <Group />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path=":groupId/groupLedger"
                      element={
                        <ProtectedRoute>
                          <MainGroupLedgerPage />
                        </ProtectedRoute>
                      }
                    >
                      <Route
                        index
                        element={
                          <ProtectedRoute>
                            <GroupLedger />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path=":ledgerId/groupVoucher"
                        element={
                          <ProtectedRoute>
                            <Groupvoucher />
                          </ProtectedRoute>
                        }
                      />
                    </Route>
                  </Route>

                  <Route
                    path="dailybook"
                    element={
                      <ProtectedRoute>
                        <DailyBook />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="bankStatement"
                    element={
                      <ProtectedRoute>
                        <BankStatement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="paymentRegister"
                    element={
                      <ProtectedRoute>
                        <PaymentRegister />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="tds"
                    element={
                      <ProtectedRoute>
                        <TDS />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="allInvoice"
                    element={
                      <ProtectedRoute>
                        <AllInvoice />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="manageSales"
                    element={
                      <ProtectedRoute>
                        <ManageSales />
                      </ProtectedRoute>
                    }
                  />

                  {/* Settings Routes */}
                  <Route
                    path="setting"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  >
                    <Route
                      index
                      element={
                        <ProtectedRoute>
                          <VoucherTypePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="voucherType"
                      element={
                        <ProtectedRoute>
                          <VoucherTypePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="ledgerType"
                      element={
                        <ProtectedRoute>
                          <LedgerTypePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="statutory"
                      element={
                        <ProtectedRoute>
                          <Statutory />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Route>

                <Route path="" element={<div>account second page</div>} />
                <Route
                  path="accountthird"
                  element={<div>account third page</div>}
                />
                <Route
                  path="accountforth"
                  element={<div>account forth page</div>}
                />
                <Route
                  path="accountfive"
                  element={<div>Account five page</div>}
                />
                <Route
                  path="accountsix"
                  element={<div>Account six page</div>}
                />
              </Route>
              {/* end */}
              {/* operation module Routes */}
              <Route path="/erp/:userid/operation" element={<ComingSoonPage />}>
                <Route path="" element={<div>Operation Number one </div>} />
                <Route
                  path="operationtwo"
                  element={<div>Operation Number Two</div>}
                />
                <Route
                  path="operationthree"
                  element={<div>Operation Number Three</div>}
                />
                <Route
                  path="operationfour"
                  element={<div>Operation Number Four</div>}
                />
                <Route
                  path="operationfive"
                  element={<div>Operation Number Five</div>}
                />
                <Route
                  path="operationsix"
                  element={<div>Operation Number Six</div>}
                />
              </Route>
              {/* end */}
              {/* manage client module route */}
              <Route
                path="/erp/:userid/manageclient"
                element={<ComingSoonPage />}
              >
                <Route path="" element={<div>Client Number One</div>} />
                <Route
                  path="clienttwo"
                  element={<div>Client Number Two</div>}
                />
                <Route
                  path="clientthree"
                  element={<div>Client Number Three</div>}
                />
                <Route
                  path="clientfour"
                  element={<div>Client Number Four</div>}
                />
                <Route
                  path="clientfive"
                  element={<div>Client Number Five</div>}
                />
                <Route
                  path="clientsix"
                  element={<div>Client Number Six</div>}
                />
              </Route>
              {/* end */}
              {/* Activity Master module routes */}
              <Route path="/erp/:userid/activity" element={<ComingSoonPage />}>
                <Route path="" element={<div>Activity Number One</div>} />
                <Route
                  path="activitytwo"
                  element={<div>Activity Number Two</div>}
                />
                <Route
                  path="activitythree"
                  element={<div>Activity Number Three</div>}
                />
                <Route
                  path="activityfour"
                  element={<div>Activity Number Four</div>}
                />
                <Route
                  path="activityfive"
                  element={<div>Activity Number Five</div>}
                />
                <Route
                  path="activitysix"
                  element={<div>Activity Number Six</div>}
                />
              </Route>
              {/* end */}
              {/* quality module routes */}
              <Route
                path="/erp/:userid/quality"
                element={
                  <ProtectedRoute>
                    <QualityModule />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="ivr"
                  element={
                    <ProtectedRoute>
                      <IVR />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="qualitytwo"
                  element={<div>Quality Number Two</div>}
                />
                <Route
                  path="qualitythree"
                  element={<div>Quality Number Three</div>}
                />
                <Route
                  path="qualityfour"
                  element={<div>Quality Number Four</div>}
                />
                <Route
                  path="qualityfive"
                  element={<div>Quality Number Five</div>}
                />
                <Route
                  path="qualitysix"
                  element={<div>Quality Number Six</div>}
                />
              </Route>
              {/* end */}

              {/* Industry route */}
              <Route
                path="/erp/:userid/industries"
                element={
                  <ProtectedRoute>
                    <Industry />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="industryData"
                  element={
                    <ProtectedRoute>
                      <IndustryData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="subindustry"
                  element={
                    <ProtectedRoute>
                      <SubIndustry />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="subsubindustry"
                  element={
                    <ProtectedRoute>
                      <SubsubIndustry />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="industry"
                  element={
                    <ProtectedRoute>
                      <Industries />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* end */}

              {/* Vebdors Url */}
              <Route
                path="/erp/:userid/vendors"
                element={
                  <ProtectedRoute>
                    <VendorsList />
                  </ProtectedRoute>
                }
              />

              {/* end */}

              <Route
                path="/erp/:userid/setting/erpSetting"
                element={
                  <ProtectedRoute>
                    <SettingMainPage />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="leadStatus"
                  element={
                    <ProtectedRoute>
                      <LeadStatusPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="products"
                  element={
                    <ProtectedRoute>
                      <ProductsChange />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="products/:productId/arrangement"
                  element={
                    <ProtectedRoute>
                      <BusinessArrangement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="products/:productId/arrangement/:arrangementId/productCategory"
                  element={
                    <ProtectedRoute>
                      <ProductCategory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="products/:productId/arrangement/:arrangementId/productCategory/:productCategoryId"
                  element={
                    <ProtectedRoute>
                      <ProductSubcategory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="category"
                  element={
                    <ProtectedRoute>
                      <LeadCategory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="slug"
                  element={
                    <ProtectedRoute>
                      <SlugCreate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="urls"
                  element={
                    <ProtectedRoute>
                      <UrlsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="comments"
                  element={
                    <Suspense fallback={<SpinLoading />}>
                      <ProtectedRoute>
                        {" "}
                        <Comments />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="desigination"
                  element={
                    <Suspense fallback={<SpinLoading />}>
                      <ProtectedRoute>
                        <Desigination />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="department"
                  element={
                    <Suspense fallback={<SpinLoading />}>
                      <ProtectedRoute>
                        <Department />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="ipaddress"
                  element={
                    <Suspense fallback={<SpinLoading />}>
                      <ProtectedRoute>
                        <IpAddress />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="procurement"
                  element={
                    <Suspense fallback={<SpinLoading />}>
                      <ProtectedRoute>
                        <Procurement />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="clientDesignation"
                  element={
                    <Suspense fallback={<SpinLoading />}>
                      <ProtectedRoute>
                        <ClientDesigination />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="proposalTemplate"
                  element={
                    <Suspense fallback={<SpinLoading />}>
                      <ProtectedRoute>
                        <ProposalTemplate />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
              </Route>
              <Route
                path="/erp/:userid/setting/accountSetting"
                element={
                  <ProtectedRoute>
                    <AccountSettingPage />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="voucherType"
                  element={
                    <ProtectedRoute>
                      <VoucherTypePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="ledgerType"
                  element={
                    <ProtectedRoute>
                      <LedgerTypePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="statutory"
                  element={
                    <ProtectedRoute>
                      <Statutory />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* profile routes */}
              <Route path="/erp/:userid/profile" element={<ComingSoonPage />}>
                <Route path="" element={<div>Profile Number One</div>} />
                <Route
                  path="profiletwo"
                  element={<div>Profile Number Two</div>}
                />
                <Route
                  path="profilethree"
                  element={<div>Profile Number Three</div>}
                />
                <Route
                  path="profilefour"
                  element={<div>Profile Number Four</div>}
                />
              </Route>
              {/* end */}
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </ConfigProvider>
  );
}

export default App;
