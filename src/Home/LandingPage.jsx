import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../Images/CORPSEED.webp";
import img1 from "../Images/COMPLIANCE_RISK_MANAGEMENT.png";
import im2 from "../Images/COMPLIANCE_MONITORING_FRAMEWORK.png";
import img3 from "../Images/OUTSOURCE_AND_MANAGE_TASKS.png";
import img4 from "../Images/AUTOMATED_TRIGGERS_AND_ALERTS.png";
import masterImg from "../Images/ERP2.png";
import img6 from "../Images/COMPREHENSIV_DASHBOARDS_AND_REPORTS-01.png";
import erpNew from "../Images/erp-new.webp";
import facebook from "../Images/facebook.png";
import instagram from "../Images/instagram.png";
import twitterX from "../Images/twitter_x.png";
import linkedin from "../Images/linkedin.png";
import pintrest from "../Images/pintrest.png";
import youtube from "../Images/youtube.png";
import "./LandingPage.scss";
import { Icon } from "@iconify/react";

const LandingPage = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [visible, setVisible] = useState(true);

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;
    setVisible(prevScrollPos > currentScrollPos);
    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);
  return (
    <>
      <div id="page" className="site m-transparent-header">
        <a className="skip-link screen-reader-text" href="#primary">
          Skip to content
        </a>

        <header id="masthead" className="l-header site-header">
          <div className="l-header-inner">
            <div className="l-wrapper">
              <div className="w-100 pt2 pt3-l flex justify-start">
                <div className="l-header-logo-wrapper flex-auto relative z-9999">
                  <img
                    src={logo}
                    className="db no-lazyload"
                    alt="corpseed logo"
                    width="80px"
                    height="60px"
                  />
                </div>

                <nav
                  id="site-navigation"
                  className="l-header-nav main-navigation flex-auto flex"
                >
                  <span
                    className="menu-toggle dib pointer js-nav-btn relative z-9999"
                    aria-label="Open the menu"
                  >
                    <span className="line bg-blue" aria-hidden="true"></span>
                    <span className="line bg-blue" aria-hidden="true"></span>
                    <span className="line bg-blue" aria-hidden="true"></span>
                  </span>

                  {/* <ul
                    id="menu-main-navigation"
                    className="menu menu-main js-nav-menu"
                  >
                    <li
                      id="menu-item-12"
                      className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children submenu"
                    >
                      <a href="#" className="nav-products-link js-sub-menu-link">
                        Product Overview
                      </a>

                      <div className="sub-menu sub-menu-column-3 dn">
                        <ul className="list w-33-l pa3-l">
                          <li
                            id="menu-item-450"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <p className="list-title ttu">
                              Forecasting &amp; Purchasing
                            </p>
                          </li>

                          <li
                            id="menu-item-457"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="inventory-planning.html"
                              className="icon-sm icon-demand "
                              data-wpel-link="internal"
                            >
                              Inventory Planning
                            </a>
                          </li>
                        </ul>

                        <ul className="list w-33-l pa3-l">
                          <li
                            id="menu-item-449"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <p className="list-title ttu">Operational efficiency</p>
                          </li>

                          <li
                            id="menu-item-455"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="retail-management-software.html"
                              className="icon-sm icon-order "
                              data-wpel-link="internal"
                            >
                              Inventory &amp; Order Management
                            </a>
                          </li>

                          <li
                            id="menu-item-458"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="shipping-fulfillment-software.html"
                              className="icon-sm icon-shipping "
                              data-wpel-link="internal"
                            >
                              Shipping &amp; Fulfillment
                            </a>
                          </li>

                          <li
                            id="menu-item-466"
                            className="menu-item menu-item-type-custom menu-item-object-custom last-item"
                          >
                            <a
                              href="pos-software.html"
                              className="icon-sm icon-pos "
                              data-wpel-link="internal"
                            >
                              POS
                            </a>
                          </li>

                          <li
                            id="menu-item-459"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="warehouse-management-system.html"
                              className="icon-sm icon-warehouse "
                              data-wpel-link="internal"
                            >
                              Warehouse Management
                            </a>
                          </li>

                          <li
                            id="menu-item-465"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="retail-crm.html"
                              className="icon-sm icon-crm "
                              data-wpel-link="internal"
                            >
                              CRM
                            </a>
                          </li>
                        </ul>

                        <ul className="list w-33-l pa3-l">
                          <li
                            id="menu-item-448"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <p className="list-title ttu">Data insights</p>
                          </li>

                          <li
                            id="menu-item-463"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="retail-reporting-analytics.html"
                              className="icon-sm icon-reporting "
                              data-wpel-link="internal"
                            >
                              Retail Analytics
                            </a>
                          </li>

                          <li
                            id="menu-item-460"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="retail-accounting-software.html"
                              className="icon-sm icon-retail "
                              data-wpel-link="internal"
                            >
                              Retail Accounting
                            </a>
                          </li>
                        </ul>
                      </div>
                    </li>

                    <li
                      id="menu-item-13"
                      className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children submenu"
                    >
                      <a href="#" className="nav-services-link js-sub-menu-link">
                        Services
                      </a>

                      <ul className="sub-menu dn">
                        <li
                          id="menu-item-18"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="implementation-and-consultancy.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Implementation</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-19"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="training.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Training</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-20"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="/customer-support"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Support</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-21"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="customer-success.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Customer Success</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-480"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="flexible-infrastructure.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            Flexible Infrastructure
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li
                      id="menu-item-20"
                      className="menu-item menu-item-type-custom menu-item-object-custom"
                    >
                      <a href="pricing.html" className="nav-pricing-link ">
                        Pricing
                      </a>
                    </li>

                    <li
                      id="menu-item-14"
                      className="menu-item menu-item-type-custom menu-item-object-custom"
                    >
                      <a
                        href="app-store.html"
                        className="nav-integrations-link"
                        data-wpel-link="internal"
                      >
                        App Store
                      </a>
                    </li>

                    <li
                      id="menu-item-15"
                      className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children submenu"
                    >
                      <a
                        href="#"
                        className="nav-who-we-serve-link js-sub-menu-link"
                      >
                        Who we serve
                      </a>

                      <div className="sub-menu sub-menu-column-2 dn">
                        <ul className="list w-50-l pa3-l">
                          <li
                            id="menu-item-400"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <p className="list-title ttu">By Business Type</p>
                          </li>

                          <li
                            id="menu-item-467"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="ecommerce-management.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>E-Commerce Businesses</span>
                            </a>
                          </li>

                          <li
                            id="menu-item-470"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="multichannel.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>Multichannel Businesses</span>
                            </a>
                          </li>

                          <li
                            id="menu-item-471"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="direct-to-consumer.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>Direct-To-Consumer Businesses</span>
                            </a>
                          </li>

                          <li
                            id="menu-item-468"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="wholesale-management.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>Wholesale &amp; B2B Businesses</span>
                            </a>
                          </li>
                        </ul>

                        <ul className="list w-50-l pa3-l">
                          <li
                            id="menu-item-401"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <p className="list-title ttu">By Ecommerce Channel</p>
                          </li>

                          <li
                            id="menu-item-472"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="bigcommerce.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>BigCommerce Businesses</span>
                            </a>
                          </li>

                          <li
                            id="menu-item-473"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="magento.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>Magento Businesses</span>
                            </a>
                          </li>

                          <li
                            id="menu-item-474"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="shopify.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>Shopify Businesses</span>
                            </a>
                          </li>

                          <li
                            id="menu-item-475"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="amazon.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>Amazon Businesses</span>
                            </a>
                          </li>

                          <li
                            id="menu-item-476"
                            className="menu-item menu-item-type-custom menu-item-object-custom"
                          >
                            <a
                              href="ebay.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>eBay Businesses</span>
                            </a>
                          </li>

                          <li
                            id="menu-item-477"
                            className="menu-item menu-item-type-custom menu-item-object-custom last-item"
                          >
                            <a
                              href="walmart.html"
                              className=""
                              data-wpel-link="internal"
                            >
                              <span>Walmart Businesses</span>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </li>

                    <li
                      id="menu-item-16"
                      className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children submenu"
                    >
                      <a
                        href="#"
                        className="nav-why-brightpearl-link js-sub-menu-link"
                      >
                        Why Brightpearl
                      </a>

                      <ul className="sub-menu dn">
                        <li
                          id="menu-item-23"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="why-brightpearl.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Why Brightpearl</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-24"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="customer-stories.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Customer Stories</span>
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li
                      id="menu-item-17"
                      className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children submenu"
                    >
                      <a href="#" className="nav-resources-link js-sub-menu-link">
                        Resources
                      </a>

                      <ul className="sub-menu dn">
                        <li
                          id="menu-item-27"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="resource-center.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Resource Center</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-28"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="ecommerce-guides.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Guides</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-29"
                          className="menu-item menu-item-type-custom menu-item-object-custom current-menu-item current_page_item menu-item-home"
                        >
                          <a
                            href="blog.html"
                            className="nav-blog-link"
                            data-wpel-link="internal"
                          >
                            <span>Blog</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-30"
                          className="menu-item menu-item-type-custom menu-item-object-custom"
                        >
                          <a
                            href="press-and-media.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Press</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-31"
                          className="menu-item menu-item-type-custom menu-item-object-custom last-item"
                        >
                          <a
                            href="life-is-short-automate.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Life is Short, Let's Automate</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-32"
                          className="menu-item menu-item-type-custom menu-item-object-custom last-item"
                        >
                          <a
                            href="retales.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Re:tales Podcast</span>
                          </a>
                        </li>

                        <li
                          id="menu-item-33"
                          className="menu-item menu-item-type-custom menu-item-object-custom last-item"
                        >
                          <a
                            href="peak-season-series-2023.html"
                            className=""
                            data-wpel-link="internal"
                          >
                            <span>Peak Season Series 2023</span>
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li
                      id="menu-item-34"
                      className="menu-item menu-item-type-custom menu-item-object-custom last"
                    >
                      <a
                        href="bookdemo.html"
                        data-wpel-link="internal"
                        className="btn btn--block pv3 ph3-plus fw6 no-underline tc mt4 js-tlm-tracking"
                      >
                        Book a Demo
                      </a>
                    </li>
                  </ul> */}
                </nav>

                <div className="l-utilities-nav flex-auto center tr dn">
                  <ul className="list pl0 mv1 w-100">
                    <li className="ph3 dib">
                      {/* <a
                        href="https://login.brightpearlapp.com/"
                        id="login-btn-main"
                        className="nav-link nav-link-login no-underline"
                        data-wpel-link="external"
                        target="_blank"
                        rel="external noopener noreferrer"
                      >
                        Login
                      </a> */}
                      <Link to="/erp/login">Login</Link>
                    </li>
                    {/* <li className="pl1 dib">
                      <a
                        className="btn btn--std ph3-plus pv3 demo-btn-main js-tlm-tracking"
                        href="bookdemo.html"
                        data-wpel-link="internal"
                      >
                        Book a demo
                      </a>
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main id="primary" className="site-main">
          <section className="m-hero-gf m-hero-gf-home bg-black relative z-1">
            <div className="m-hero-gf-inner">
              <div className="l-wrapper mw-82 pv4 pb5-l">
                <div className="flex-l flex-row-l h-100 relative">
                  <div className="w-60-l pr5-l m-gf-hero-titles mw-700 max-w-none-l pb4 pb0-l center no-center-l">
                    <div className="title-wrapper tl">
                      <h1 className="pre-header sg-jade-light ttu title-sequel lh-copy mb2">
                        Effortless Compliance, Seamless Growth
                      </h1>

                      <h2 className="as-header-1 white pb3">
                        Streamline Customer Process Integration
                      </h2>

                      <div className="cms m-checks-list white">
                        <p>
                          Our ERP Centralized system centralizes customer
                          information and processes to enhance collaboration,
                          improve data flow, and ensure timely delivery of
                          services. Integrating all departments Marketing,
                          Presale, Quality, Sales, Accounts, Client
                          Relationship, Technical, liaisoning, Procurement, and
                          Human Resource etc ensures that each department has
                          the most up-to-date information, enabling quicker
                          decision-making and a smooth customer experience.
                        </p>
                        {/* <p>
                          We streamline the process of obtaining necessary
                          business approvals to ensure your operations are fully
                          compliant with regulatory requirements.
                        </p> */}
                        <h4 className="as-header-1 white pb3">
                          Various Modules in One Integrated ERP
                        </h4>
                        <ul>
                          <li>Marketing</li>
                          <li>Quality Management</li>
                          <li>Customer Relationship Management</li>
                          <li>Accounts</li>
                          <li>Operations</li>
                          <li>Procurement</li>
                          <li>Human Resource Management</li>
                          <li>Liaisoning</li>
                        </ul>
                      </div>

                      {/* <div className="flex-l flex-row-l justify-between pt3-l tc tl-l">
                        <div className="w-50-l pt2">
                          <a href="#" className="btn btn--std js-form-reveal">
                            Book a free demo today
                          </a>
                        </div>

                        <div className="w-50-l tc tl-l pt3 pt2-l">
                          <img
                            src="wp-content/themes/bp-wp-2021/assets/img/sage/logo-capterra-with-score.svg"
                            alt="Capterra"
                            className="no-lazyload dib"
                            width="130"
                            height="42"
                          />
                        </div>
                      </div> */}
                    </div>
                  </div>

                  <div className="w-40-l ph3-l mw-500 max-w-none-l center no-center-l">
                    <img
                      fetchpriority="high"
                      src={img6}
                      alt="Brightpearl Composite"
                      className="no-lazyload"
                      width="454"
                      height="591"
                      style={{ marginTop: "80px" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="l-wrapper mw-82 tc overflow-hidden pb4 pb0-l">
              <p className="intro-text sg-jade-light mb0 pb4 pb5-l">
                5,000+ pioneering brands rely on Brightpearl to grow further and
                faster
              </p>

              <ul className="m-company-logos-list m-columns-wrapper list flex flex-wrap flew-row justify-between">
                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-wild%402x.png"
                    alt="Wild"
                    className="dib"
                    width="128px"
                    height="40px"
                  />
                </li>
                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-goose-gander%402x.png"
                    alt="Goose and Gander"
                    className="dib"
                    width="128px"
                    height="20px"
                  />
                </li>
                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-monica-and-andy.png"
                    alt="Monica and Andy"
                    className="dib"
                    width="128px"
                    height="41px"
                  />
                </li>
                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-piglet%402x.png"
                    alt="Piglet"
                    className="dib"
                    width="112px"
                    height="45px"
                  />
                </li>
                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-lovepop%402x.png"
                    alt="Lovepop"
                    className="dib"
                    width="63px"
                    height="45px"
                  />
                </li>
                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-finlay%402x.png"
                    alt="Finlay"
                    className="dib"
                    width="128px"
                    height="18px"
                  />
                </li>

                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%2013'%3E%3C/svg%3E"
                    alt="Naturecan"
                    className="dib"
                    width="128px"
                    height="13px"
                    data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-naturecan.png"
                  />
                  <noscript>
                    <img
                      src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-naturecan.png"
                      alt="Naturecan"
                      className="dib"
                      width="128px"
                      height="13px"
                    />
                  </noscript>
                </li>
                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-flex.png"
                    alt="Flex"
                    className="dib"
                    width="74px"
                    height="45px"
                  />
                </li>

                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%2017'%3E%3C/svg%3E"
                    alt="Passenger"
                    className="dib"
                    width="128px"
                    height="17px"
                    data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-passenger%402x.png"
                  />
                  <noscript>
                    <img
                      src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-passenger%402x.png"
                      alt="Passenger"
                      className="dib"
                      width="128px"
                      height="17px"
                    />
                  </noscript>
                </li>
                <li className="ph3 ph4-l pb3 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%2036'%3E%3C/svg%3E"
                    alt="Jimmy Lion"
                    className="dib"
                    width="128px"
                    height="36px"
                    data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-jimmy-lion%402x.png"
                  />
                  <noscript>
                    <img
                      src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-jimmy-lion%402x.png"
                      alt="Jimmy Lion"
                      className="dib"
                      width="128px"
                      height="36px"
                    />
                  </noscript>
                </li>
                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-fairfax-favor%402x.png"
                    alt="fairfax & Favor"
                    className="dib"
                    width="120px"
                    height="45px"
                  />
                </li>
                <li className="ph3 ph4-l pb4 tc w-33 w-25-m w-15-l flex flex-row items-center justify-center">
                  <img
                    src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20128%208'%3E%3C/svg%3E"
                    alt="Holland Cooper"
                    className="dib"
                    width="128px"
                    height="8px"
                    data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-holland-cooper.png"
                  />
                  <noscript>
                    <img
                      src="wp-content/themes/bp-wp-2021/assets/img/home-page/logos/logo-holland-cooper.png"
                      alt="Holland Cooper"
                      className="dib"
                      width="128px"
                      height="8px"
                    />
                  </noscript>
                </li>
              </ul>
            </div> */}
          </section>

          {/* <section className="introduction bg-black">
            <div className="l-wrapper mw-82">
              <div className="flex-l flex-row-l pb4 pb5-l pt4-l">
                <div className="w-50-l tc tl-l pb4 pb0-l pt5-l pr5-l flex-l flex-row-l items-center-l">
                  <div className="intro-content">
                    <h2 className="mid title-sequel white mb0 pb4">
                      Tough times don’t last. <br />{" "}
                      <i>Brightpearl customers do.</i>
                    </h2>

                    <div className="cms white mw-600 center no-center-l">
                      <p>
                        A global market slowdown. A supply chain crisis.
                        Wavering consumer demand. Rising costs. It’s a tricky
                        time to be in retail. But it doesn’t have to be.
                      </p>
                      <p>
                        Out of the chaos,{" "}
                        <strong>opportunities are emerging</strong>. Be ready to
                        seize them with Brightpearl.
                      </p>
                      <p>
                        Automate your operations, intelligently plan your
                        inventory and make your investments go further with our
                        #1 Retail Operating System.
                      </p>
                    </div>

                    <a href="#" className="btn btn--std mt3 js-form-reveal">
                      Book a demo
                    </a>
                  </div>
                </div>

                <div className="w-50-l pl4-l flex-l flex-row-l">
                  <div className="center no-center-l mw-600 pt4-l tc tl-l">
                    <img
                      width="1330"
                      height="1148"
                      src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201330%201148'%3E%3C/svg%3E"
                      alt="Brightpearl customers"
                      className="dib"
                      data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/sage/tough-times-dont-last.png"
                    />
                    <noscript>
                      <img
                        width="1330"
                        height="1148"
                        src="wp-content/themes/bp-wp-2021/assets/img/sage/tough-times-dont-last.png"
                        alt="Brightpearl customers"
                        className="dib"
                      />
                    </noscript>
                  </div>
                </div>
              </div>
            </div>
          </section> */}

          <section className="what-we-offer">
            <div className="z-1">
              <div className="l-wrapper mw-82">
                <div className="row-1 flex-l flex-row-l pv4 pt5-l relative z-5">
                  <div className="w-50-l pr4-l pb3 center no-center-l mw-600">
                    <img
                      src={img1}
                      className="db"
                      alt="home-free-up-time"
                      width="568px"
                      height="467px"
                      data-lazy-src="wp-content/uploads/2024/03/home-free-up-time.png"
                    />
                  </div>

                  <div className="w-50-l pl5-l flex-l flex-row-l items-center-l">
                    <div className="center no-center-l mw-600 pt4-l tc tl-l">
                      <h2 className="mid title-sequel pt3">
                        Centralized Data, Seamless Collaboration- “One System,
                        Infinite Possibilities”
                      </h2>
                      <h3>by automating (almost) everything</h3>
                      <p>
                        Our system connects all the business functions, from
                        Marketing to Client Relations, Sales, Accounts,
                        Technical, Quality, procurement, HRM and Liaisoning,
                        into a unified platform, ensuring that information flows
                        seamlessly across departments. With a single source of
                        truth, you can streamline processes, improve accuracy,
                        and boost efficiency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="m-sections-wrapper bg-grey">
              <div className="l-wrapper mw-82">
                <div className="row-2 flex-l flex-row-l pv4 pt5-l">
                  <div className="w-50-l pl4-l pb3 center no-center-l mw-600 order-1-l flex-l flex-row-l items-center-l">
                    <img
                      src={im2}
                      className="db"
                      alt="home-supply-chain"
                      width="568px"
                      height="414px"
                      data-lazy-src="wp-content/uploads/2024/02/home-supply-chain.png"
                    />
                  </div>

                  <div className="w-50-l pr5-l order-0-l flex-l flex-row-l items-center-l">
                    <div className="center no-center-l mw-600 pt4-l tc tl-l">
                      <h2 className="mid title-sequel pt3">
                        Accelerate Business Growth with Smarter Solutions- “From
                        Leads to Loyalty: Every Step Streamlines”
                      </h2>
                      <h3>
                        Elevate your business’s compliance strategy with our
                        advanced monitoring framework.
                      </h3>
                      <p>
                        From lead generation to client on-boarding, sales
                        tracking and payment processing the system helps you to
                        manage it all. Automate workflows, reduce manual tasks
                        and deliver exceptional service that drives customer
                        satisfaction and business growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="l-wrapper mw-82">
              <div className="row-3 flex-l flex-row-l pv4 pt5-l">
                <div className="w-50-l pr4-l pb3 center no-center-l mw-600">
                  <img
                    src={img3}
                    className="db"
                    alt="home-kpi-summary"
                    width="568px"
                    height="518px"
                    data-lazy-src="wp-content/uploads/2024/03/home-kpi-summary.png"
                  />
                </div>

                <div className="w-50-l pl5-l flex-l flex-row-l items-center-l">
                  <div className="center no-center-l mw-600 pt4-l tc tl-l">
                    <h2 className="mid title-sequel pt3">
                      Real-Time Insights for Informed Decisions:” Empower your
                      Teams and Data-Driven Decisions”
                    </h2>
                    {/* <h3>
                      Streamline your operations by outsourcing and managing
                      critical tasks with ease.{" "}
                    </h3> */}
                    <p>
                      Get instant access to key business metrics, reports, and
                      dashboards. With real-time updates and analytics. It helps
                      in making smarter decisions and adapting quickly to client
                      needs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-grey">
              <div className="l-wrapper mw-82">
                <div className="row-4 flex-l flex-row-l pv4 pv5-l">
                  <div className="w-50-l pl4-l pb2 center no-center-l mw-600 order-1-l">
                    <div className="mw-400 center">
                      <img
                        src={img4}
                        className="db m-picture-block"
                        alt="logos-plug-and-play-apps"
                        width="363px"
                        height="363px"
                        data-lazy-src="wp-content/uploads/2024/02/logos-plug-and-play-apps.png"
                      />
                    </div>
                  </div>

                  <div className="w-50-l pr5-l order-0-l flex-l flex-row-l items-center-l">
                    <div className="center no-center-l mw-600 tc tl-l">
                      <h2 className="mid title-sequel pt3">
                        Effortless client Management:-“Every Interaction Counts,
                        All in one Place”
                      </h2>

                      <p>
                        Track manage, and optimize every client touchpoint. With
                        the Client relationship module, You will have a
                        360-degree view of all interactions, feedback, and
                        project status helping you build stronger, and lasting
                        relationship within the departments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="l-wrapper mw-82">
              <div className="row-5 flex-l flex-row-l pt4 pt5-l">
                <div className="w-50-l pb4 pb0-l center no-center-l mw-600  flex-l flex-row-l items-end-l">
                  <img
                    src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20600%20359'%3E%3C/svg%3E"
                    alt="Brightpearl support"
                    className="db"
                    width="600px"
                    height="359px"
                    data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/home-page/brightpearl-support%402x.webp"
                  />
                  <noscript>
                    <img
                      src="wp-content/themes/bp-wp-2021/assets/img/home-page/brightpearl-support%402x.webp"
                      alt="Brightpearl support"
                      className="db"
                      width="600px"
                      height="359px"
                    />
                  </noscript>
                </div>

                <div className="w-50-l pb4 pl5-l flex-l flex-row-l items-center-l">
                  <div className="center no-center-l mw-600 pt4-l tc tl-l">
                    <h2 className="mid title-sequel">
                      Expert support
                      <br /> <i>at every step</i>
                    </h2>
                    <h3>with our end-to-end services</h3>
                  </div>
                  <p>
                    The right software is important, but it’s not enough on its
                    own. To unlock your unique growth potential, it has to be
                    optimized by experts and backed up by training and support.
                  </p>
                  <p>
                    At Brightpearl, our retail experts are with you every step
                    of the way. From{" "}
                    <a
                      href="implementation-and-consultancy.html"
                      data-wpel-link="internal"
                    >
                      flawless implementation
                    </a>{" "}
                    with a proven <strong>97% success rate</strong> and bespoke
                    onboarding training to ongoing consulting and 24/7 support,
                    we’ll ensure you get the very best from Brightpearl.
                  </p>
                </div>
              </div>
            </div> */}
          </section>

          <section className="get-connected-in-page bg-black">
            <div className="l-wrapper mw-82 pb4 pt5 pv5-l">
              <div className="row-5 flex-l flex-row-l">
                <div className="w-40-l pb4 pb0-l pl5-l mw-350 max-w-none-l center no-center-l order-1-l">
                  <img
                    src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20385'%3E%3C/svg%3E"
                    alt="Keep Growing"
                    className="db"
                    width="500px"
                    height="385px"
                    data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/sage/keep-growing.png"
                  />
                  <noscript>
                    <img
                      src="wp-content/themes/bp-wp-2021/assets/img/sage/keep-growing.png"
                      alt="Keep Growing"
                      className="db"
                      width="500px"
                      height="385px"
                    />
                  </noscript>
                </div>

                <div className="w-60-l pb4 pb0-l pr5-l center no-center-l mw-600 max-w-none-l flex-l flex-row-l items-center-l order-0-l">
                  <div className="white mw-800 mw-none-l center tc tl-l pv4">
                    <h2 className="as-header-1 white">Benifits</h2>
                    {/* <p className="intro-text mb4 fw6">
                      Discover how Corpseed can help control your cash flow
                    </p> */}
                    <ul class="benifit-list d-flex flex-column gap-8 list-unstyled text-white">
                      <li className="benifit-list-li">
                        <div>
                          <Icon
                            icon="fluent:circle-12-filled"
                            height={12}
                            width={12}
                            className="circle-icon"
                          />
                        </div>
                        <p>
                          <strong>Faster Response Times</strong>: Information
                          flow between teams is faster, reducing delays in
                          customer interactions.
                        </p>
                      </li>
                      <li className="benifit-list-li">
                        <div>
                          <Icon
                            icon="fluent:circle-12-filled"
                            height={12}
                            width={12}
                            className="circle-icon"
                          />
                        </div>
                        <p>
                          <strong>Improved Accuracy</strong>: Centralizing data
                          ensures consistency and accuracy across all
                          departments.
                        </p>
                      </li>
                      <li className="benifit-list-li">
                        <div>
                          {" "}
                          <Icon
                            icon="fluent:circle-12-filled"
                            height={12}
                            width={12}
                            className="circle-icon"
                          />
                        </div>
                        <p>
                          <strong>Enhanced Collaborations</strong>: By having
                          real-time access to client data, teams work together
                          more effectively, improving overall client
                          satisfaction.
                        </p>
                      </li>
                      <li className="benifit-list-li">
                        <div>
                          <Icon
                            icon="fluent:circle-12-filled"
                            height={12}
                            width={12}
                            className="circle-icon"
                          />
                        </div>
                        <p>
                          {" "}
                          <strong>Cost Efficiency</strong>: Streamlining
                          workflows eliminates unnecessary steps, reducing
                          operational costs and human error.
                        </p>
                      </li>
                      <li className="benifit-list-li">
                        <div>
                          <Icon
                            icon="fluent:circle-12-filled"
                            height={12}
                            width={12}
                            className="circle-icon"
                          />
                        </div>
                        <p>
                          <strong>Efficiency</strong>: Automated processes,
                          reduce manual errors, and speed up response times.
                        </p>
                      </li>
                      <li className="benifit-list-li">
                        <div>
                          <Icon
                            icon="fluent:circle-12-filled"
                            height={12}
                            width={12}
                            className="circle-icon"
                          />
                        </div>
                        <p>
                          <strong>Accuracy</strong>: A single source of truth
                          for all client data ensures consistency across teams.
                        </p>
                      </li>
                      <li className="benifit-list-li">
                        <div>
                          {" "}
                          <Icon
                            icon="fluent:circle-12-filled"
                            height={12}
                            width={12}
                            className="circle-icon"
                          />
                        </div>
                        <p>
                          <strong>Growth</strong>: Faster project delivery,
                          enhanced collaborations, and better customer
                          experience drive business success.
                        </p>
                      </li>
                      <li className="benifit-list-li">
                        <div>
                          {" "}
                          <Icon
                            icon="fluent:circle-12-filled"
                            height={12}
                            width={12}
                            className="circle-icon"
                          />
                        </div>
                        <p>
                          <strong>Client Satisfaction</strong>: Improves service
                          delivery, project management, and communications.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="trusted-content">
            <div className="l-wrapper mw-82 pv4 pt5-l overflow-hidden">
              <div className="center mw-800 tc mb4 mb5-l">
                {/* <h2 className="as-intro-text sg-jade-mid mb0 pb2">Our customers</h2> */}
                <h3 className="as-header-2 title-sequel">
                  ERP- Where every department from Marketing to Liaisoning,
                  works as one for smarter business solutions and happier
                  clients
                </h3>
              </div>

              {/* <div className="flex flex-row flex-wrap m-columns-wrapper m-columns-wrapper--one-rem">
                <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                  <div className="ph3 h-100 pb2-l">
                    <a
                      href="customer-stories/snow-cosmetics.html"
                      className="db h-100 relative pb4-ns hover-opacity"
                      data-wpel-link="internal"
                    >
                      <div
                        className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                        // style="background: url('wp-content/uploads/2022/12/customer-snow.png') center center;background-size: cover;"
                      ></div>

                      <div className="pt3 pb5 pb4-m pt4-l">
                        <p className="mb0 black fw6">
                          &quot;Brightpearl’s Automation Engine transformed how
                          we manage peaks. Without it, I would have had to
                          double our warehouse & operations staff. The inventory
                          planning tool factors in seasonality so that we
                          instantly say ’ok, we need to order 100,000 of that
                          item, not 10,000'.&quot;
                        </p>

                        <p className="black o-5 fw6 mv3">
                          {" "}
                          Trevor Martin, Snow’s Vice President of Operations
                        </p>

                        <p className="btn-ghost dib mb0 absolute b-1 l-0">
                          Learn more
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                  <div className="ph3 h-100 pb2-l">
                    <a
                      href="customer-stories/usa-lab.html"
                      className="db h-100 relative pb4-ns hover-opacity"
                      data-wpel-link="internal"
                    >
                      <div
                        className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                        // style="background: url('wp-content/uploads/2022/12/customer-usa-lab.jpg') center center;background-size: cover;"
                      ></div>

                      <div className="pt3 pb5 pb4-m pt4-l">
                        <p className="mb0 black fw6">
                          &quot;We had spreadsheets for everything and, at one
                          point, a third of our products were out of stock.
                          Brightpearl takes the guesswork out of managing stock.
                          Automation with Brightpearl has been fantastic, I
                          barely touch the system for standard orders.&quot;
                        </p>

                        <p className="black o-5 fw6 mv3">
                          Matt Wisniewski, COO, USA Lab
                        </p>

                        <p className="btn-ghost dib mb0 absolute b-1 l-0">
                          Learn more
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                  <div className="ph3 h-100 pb2-l">
                    <a
                      href="customer-stories/nooz-optics.html"
                      className="db h-100 relative pb4-ns hover-opacity"
                      data-wpel-link="internal"
                    >
                      <div
                        className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                        // style="background: url('wp-content/uploads/2022/12/customer-nooz-optics.jpg') center center;background-size: cover;"
                      ></div>

                      <div className="pt3 pb5 pb4-m pt4-l">
                        <p className="mb0 black fw6">
                          &quot;Brightpearl scales as we do. Previously, we were
                          reluctant to add the latest sales channels or tools
                          because it added complexity. Brightpearl has got rid
                          of that mentality – we now know we can quickly and
                          easily connect the apps we need, when we need
                          them.&quot;
                        </p>

                        <p className="black o-5 fw6 mv3">
                          Antoine Doolaeghe, Co-Founder, Nooz Optics
                        </p>

                        <p className="btn-ghost dib mb0 absolute b-1 l-0">
                          Learn more
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                  <div className="ph3 h-100 pb2-l">
                    <a
                      href="customer-stories/bond-touch.html"
                      className="db h-100 relative pb4-ns hover-opacity"
                      data-wpel-link="internal"
                    >
                      <div
                        className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                        // style="background: url('wp-content/uploads/2022/05/Bond-touch466.jpg') center center;background-size: cover;"
                      ></div>

                      <div className="pt3 pb5 pb4-m pt4-l">
                        <p className="mb0 black fw6">
                          &quot;Our aim was to stop our team doing almost all
                          manual tasks, and we were able to achieve that with
                          Brightpearl’s Automation Engine. Now, everything
                          except occasional warranty orders are handled
                          automatically.&quot;
                        </p>

                        <p className="black o-5 fw6 mv3">
                          Jorge Henriques, COO, Bond Touch
                        </p>

                        <p className="btn-ghost dib mb0 absolute b-1 l-0">
                          Learn more
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                  <div className="ph3 h-100 pb2-l">
                    <a
                      href="customer-stories/lovepop.html"
                      className="db h-100 relative pb4-ns hover-opacity"
                      data-wpel-link="internal"
                    >
                      <div
                        className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                        // style="background: url('wp-content/uploads/2020/08/Lovepop-graphic.png') center center;background-size: cover;"
                      ></div>

                      <div className="pt3 pb5 pb4-m pt4-l">
                        <p className="mb0 black fw6">
                          &quot;Our business is seasonal, we rely on Brightpearl
                          to help manage peak order volumes as well as
                          year-round implications for managing growth in overall
                          order volume. Having a system that can scale in both
                          elements is critical to our success.&quot;
                        </p>

                        <p className="black o-5 fw6 mv3">
                          Dan Nephew, Director of Systems & Operations, Lovepop
                        </p>

                        <p className="btn-ghost dib mb0 absolute b-1 l-0">
                          Learn more
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                  <div className="ph3 h-100 pb2-l">
                    <a
                      href="customer-stories/cleva.html"
                      className="db h-100 relative pb4-ns hover-opacity"
                      data-wpel-link="internal"
                    >
                      <div
                        className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                        // style="background: url('wp-content/uploads/2022/12/customer-cleva.webp') center center;background-size: cover;"
                      ></div>

                      <div className="pt3 pb5 pb4-m pt4-l">
                        <p className="mb0 black fw6">
                          &quot;With Brightpearl, you can focus on innovation
                          without being caught up in operational processes. With
                          everything taken care of in the background, your
                          business can grow at a good rate – and you feel
                          confident to move the brand forward.&quot;
                        </p>

                        <p className="black o-5 fw6 mv3">
                          Douglas Begg, Technical & Operations Director at Cleva
                          Europe
                        </p>

                        <p className="btn-ghost dib mb0 absolute b-1 l-0">
                          Learn more
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div> */}
            </div>
          </section>

          {/* <section className="brightpearl-at-a-glance bg-black">
            <div className="l-wrapper mw-82 pt5 pb4 overflow-hidden">
              <div className="pb4 white tc">
                <h2 className="white mb0 pb4 pb5-l">
                  <span id="Why_Brightpearl">Why Brightpearl</span>
                </h2>
              </div>

              <div className="flex-m flex-row-m flex-wrap-m m-columns-wrapper m-columns-wrapper--one-rem">
                <div className="w-50-m w-33-l ph3 pb4 pb5-l">
                  <div className="flex flex-row">
                    <div className="pb3 w-25">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20119%20118'%3E%3C/svg%3E"
                        alt="glance-icon-award"
                        className="dib"
                        height="118px"
                        width="119px"
                        data-lazy-src="wp-content/uploads/2024/02/glance-icon-award.png"
                      />
                      <noscript>
                        <img
                          src="wp-content/uploads/2024/02/glance-icon-award.png"
                          alt="glance-icon-award"
                          className="dib"
                          height="118px"
                          width="119px"
                        />
                      </noscript>
                    </div>

                    <div className="w-75 pl3 pl4-l cms tl white">
                      <h3 className="white mb0 pb1">Cutting-edge software</h3>

                      <p className="p18 mb0">
                        Leading tech backed up with a 97% implementation success
                        rate
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-50-m w-33-l ph3 pb4 pb5-l">
                  <div className="flex flex-row">
                    <div className="pb3 w-25">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20119%20118'%3E%3C/svg%3E"
                        alt="glance-icon-sage"
                        className="dib"
                        height="118px"
                        width="119px"
                        data-lazy-src="wp-content/uploads/2024/02/glance-icon-sage.png"
                      />
                      <noscript>
                        <img
                          src="wp-content/uploads/2024/02/glance-icon-sage.png"
                          alt="glance-icon-sage"
                          className="dib"
                          height="118px"
                          width="119px"
                        />
                      </noscript>
                    </div>

                    <div className="w-75 pl3 pl4-l cms tl white">
                      <h3 className="white mb0 pb1">Part of Sage Group Plc</h3>

                      <p className="p18 mb0">
                        We're built on a solid foundation, which helps us invest
                        in product R&D
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-50-m w-33-l ph3 pb4 pb5-l">
                  <div className="flex flex-row">
                    <div className="pb3 w-25">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20119%20118'%3E%3C/svg%3E"
                        alt="glance-icon-shopify"
                        className="dib"
                        height="118px"
                        width="119px"
                        data-lazy-src="wp-content/uploads/2024/02/glance-icon-shopify.png"
                      />
                      <noscript>
                        <img
                          src="wp-content/uploads/2024/02/glance-icon-shopify.png"
                          alt="glance-icon-shopify"
                          className="dib"
                          height="118px"
                          width="119px"
                        />
                      </noscript>
                    </div>

                    <div className="w-75 pl3 pl4-l cms tl white">
                      <h3 className="white mb0 pb1">Certified Shopify Partner</h3>

                      <p className="p18 mb0">
                        We’re proud to be founding member of Shopify’s global
                        ERP Program
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-50-m w-33-l ph3 pb4 pb5-l">
                  <div className="flex flex-row">
                    <div className="pb3 w-25">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20119%20118'%3E%3C/svg%3E"
                        alt="glance-icon-trusted"
                        className="dib"
                        height="118px"
                        width="119px"
                        data-lazy-src="wp-content/uploads/2024/02/glance-icon-trusted.png"
                      />
                      <noscript>
                        <img
                          src="wp-content/uploads/2024/02/glance-icon-trusted.png"
                          alt="glance-icon-trusted"
                          className="dib"
                          height="118px"
                          width="119px"
                        />
                      </noscript>
                    </div>

                    <div className="w-75 pl3 pl4-l cms tl white">
                      <h3 className="white mb0 pb1">Proven track record</h3>

                      <p className="p18 mb0">
                        We power millions of orders a month for some of the
                        world’s biggest brands
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-50-m w-33-l ph3 pb4 pb5-l">
                  <div className="flex flex-row">
                    <div className="pb3 w-25">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20119%20118'%3E%3C/svg%3E"
                        alt="glance-icon-star"
                        className="dib"
                        height="118px"
                        width="119px"
                        data-lazy-src="wp-content/uploads/2024/02/glance-icon-star.png"
                      />
                      <noscript>
                        <img
                          src="wp-content/uploads/2024/02/glance-icon-star.png"
                          alt="glance-icon-star"
                          className="dib"
                          height="118px"
                          width="119px"
                        />
                      </noscript>
                    </div>

                    <div className="w-75 pl3 pl4-l cms tl white">
                      <h3 className="white mb0 pb1">Excellent reviews</h3>

                      <p className="p18 mb0">
                        We’ve earned great reviews from customers, including 4.5
                        stars on Trustpilot
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-50-m w-33-l ph3 pb4 pb5-l">
                  <div className="flex flex-row">
                    <div className="pb3 w-25">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20119%20118'%3E%3C/svg%3E"
                        alt="glance-icon-headset"
                        className="dib"
                        height="118px"
                        width="119px"
                        data-lazy-src="wp-content/uploads/2024/02/glance-icon-headset.png"
                      />
                      <noscript>
                        <img
                          src="wp-content/uploads/2024/02/glance-icon-headset.png"
                          alt="glance-icon-headset"
                          className="dib"
                          height="118px"
                          width="119px"
                        />
                      </noscript>
                    </div>

                    <div className="w-75 pl3 pl4-l cms tl white">
                      <h3 className="white mb0 pb1">Expert support</h3>

                      <p className="p18 mb0">
                        Our experts are always on hand for training and support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section> */}

          {/* <section className="integrations bg-grey">
            <div className="l-wrapper mw-82 pv5">
              <div className="pb4">
                <h2 className="as-intro-text sg-jade-mid mb0 pb2">
                  Brightpearl App Store
                </h2>

                <h3 className="as-header-2">
                  Instantly connect Brightpearl with the tools you need
                  <br /> to grow fearlessly
                </h3>
              </div>

              <div className="m-integrations-grid flex flex-row flex-wrap m-columns-wrapper m-columns-wrapper--one-rem relative z-5 justify-center justify-start-l">
                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Shopify Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-shopify-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-shopify-white-bg.svg"
                          alt="Shopify Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Shopify</p>
                      <p className="mb0 lh-title">E-Commerce</p>
                    </div>
                  </div>
                </div>

                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Amazon icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-amazon-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-amazon-white-bg.svg"
                          alt="Amazon icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Amazon</p>
                      <p className="mb0 lh-title">E-Commerce</p>
                    </div>
                  </div>
                </div>

                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="BigCommerce"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-bigcommerce-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-bigcommerce-white-bg.svg"
                          alt="BigCommerce"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">BigCommerce</p>
                      <p className="mb0 lh-title">E-Commerce</p>
                    </div>
                  </div>
                </div>

                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Magento Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-magento-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-magento-white-bg.svg"
                          alt="Magento Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Magento</p>
                      <p className="mb0 lh-title">E-Commerce</p>
                    </div>
                  </div>
                </div>

                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="eBay Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-ebay-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-ebay-white-bg.svg"
                          alt="eBay Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">eBay</p>
                      <p className="mb0 lh-title">E-Commerce</p>
                    </div>
                  </div>
                </div>
                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Quickbooks Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-quickbooks-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-quickbooks-white-bg.svg"
                          alt="Quickbooks Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Quickbooks</p>
                      <p className="mb0 lh-title">Accounting</p>
                    </div>
                  </div>
                </div>

                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Lightspeed X-series Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-lightspeed-x-series-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-lightspeed-x-series-white-bg.svg"
                          alt="Lightspeed X-series Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Lightspeed</p>
                      <p className="mb0 lh-title">E-Commerce</p>
                    </div>
                  </div>
                </div>

                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Shipstation Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-shipstation-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-shipstation-white-bg.svg"
                          alt="Shipstation Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Shipstation</p>
                      <p className="mb0 lh-title">Shipping</p>
                    </div>
                  </div>
                </div>

                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Dotdigital Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-dot-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-dot-white-bg.svg"
                          alt="Dotdigital Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Dotdigital</p>
                      <p className="mb0 lh-title">E-Commerce</p>
                    </div>
                  </div>
                </div>

                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Xero Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-xero-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-xero-white-bg.svg"
                          alt="Xero Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Xero</p>
                      <p className="mb0 lh-title">Accounting</p>
                    </div>
                  </div>
                </div>
                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Square Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-square-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-square-white-bg.svg"
                          alt="Square Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Square</p>
                      <p className="mb0 lh-title">E-Commerce</p>
                    </div>
                  </div>
                </div>

                <div className="m-integrations-grid-item w-100 w-50-m w-25-l ph3 pb3">
                  <div className="bg-white br4 pa1 h-100 flex flex-row items-center">
                    <div className="m-integration-grid-logo">
                      <img
                        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2088%2088'%3E%3C/svg%3E"
                        alt="Klaviyo Icon"
                        className="db m-picture-block"
                        width="88px"
                        height="88px"
                        data-lazy-src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-klaviyo-white-bg.svg"
                      />
                      <noscript>
                        <img
                          src="wp-content/themes/bp-wp-2021/assets/img/misc/icon-klaviyo-white-bg.svg"
                          alt="Klaviyo Icon"
                          className="db m-picture-block"
                          width="88px"
                          height="88px"
                        />
                      </noscript>
                    </div>

                    <div className="m-integration-grid-text pl2">
                      <p className="intro-text mb0 lh-title pb2">Klaviyo</p>
                      <p className="mb0 lh-title">E-Commerce</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt4 pb3">
                <a
                  href="app-store.html"
                  className="btn-ghost"
                  data-wpel-link="internal"
                >
                  See all Brightpearl apps
                </a>
              </div>
            </div>
          </section> */}

          {/* <section className="news-and-events relative overflow-hidden">
            <div className="l-wrapper mw-82 pv4 pv5-l">
              <div className="pb4">
                <h2 className="as-intro-text sg-jade-mid mb0 pb2">More reading</h2>

                <h3 className="as-header-2 title-sequel">
                  Events, News and Insights
                </h3>
              </div>

              <div className="m-columns-wrapper-lg m-columns-wrapper m-columns-wrapper--one-rem">
                <div className="m-news-events-slider-wrapper js-slider-news-events">
                  <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                    <div className="ph3 h-100">
                      <a
                        href="press-and-media/press-releases/brightpearl-acquires-inventory-planner-giving-savvy-merchants-better-ways-to-accurately-predict-demand.html"
                        className="db h-100 relative pb4-ns hover-opacity"
                        target="_blank"
                        data-wpel-link="internal"
                      >
                        <div
                          className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                          // style="background: url('wp-content/uploads/2021/09/Brightpearl-Acquires-Inventory-Planner.png') center center;background-size: cover;"
                        ></div>

                        <div className="pt3 pb5 pb4-m pt4-l">
                          <p className="fw6 sg-jade-mid">
                            <span id="News">Brightpearl News</span>
                          </p>
                          <h3 className="mb3 lh-title black">
                            Brightpearl Acquires Inventory Planner
                          </h3>

                          <p className="btn-ghost mb0 absolute b-1 l-0">
                            Learn more
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>

                  <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                    <div className="ph3 h-100">
                      <a
                        href="lightning-50.html"
                        className="db h-100 relative pb4-ns hover-opacity"
                        target="_blank"
                        data-wpel-link="internal"
                      >
                        <div
                          className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                          // style="background: url('wp-content/uploads/2022/03/Screenshot-2022-03-11-at-11.42.36.png') center center;background-size: cover;"
                        ></div>

                        <div className="pt3 pb5 pb4-m pt4-l">
                          <p className="fw6 sg-jade-mid">Brightpearl News</p>
                          <h3 className="mb3 lh-title black">
                            Sign-ups are open for Brightpearl’s Lightning 50 -
                            ranking the fastest-growing UK & US e-commerce
                            brands
                          </h3>

                          <p className="btn-ghost mb0 absolute b-1 l-0">
                            Learn more
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>

                  <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                    <div className="ph3 h-100">
                      <a
                        href="ecommerce-guides/tis-the-season-us.html"
                        className="db h-100 relative pb4-ns hover-opacity"
                        target="_blank"
                        data-wpel-link="internal"
                      >
                        <div
                          className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                          // style="background: url('wp-content/uploads/2021/10/guide-detail-tis-the-season.png') center center;background-size: cover;"
                        ></div>

                        <div className="pt3 pb5 pb4-m pt4-l">
                          <p className="fw6 sg-jade-mid">Market Insights</p>
                          <h3 className="mb3 lh-title black">
                            [Exclusive report] Tis the Season (to be scalable) -
                            US
                          </h3>

                          <p className="btn-ghost mb0 absolute b-1 l-0">
                            Download now
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>

                  <div className="w-100 w-50-m w-33-l pb4 mw-500 center no-center-l">
                    <div className="ph3 h-100">
                      <a
                        href="ecommerce-guides/tis-the-season-uk.html"
                        className="db h-100 relative pb4-ns hover-opacity"
                        target="_blank"
                        data-wpel-link="internal"
                      >
                        <div
                          className="m-further-reading-link-image-wrap br6 overflow-hidden aspect-ratio aspect-ratio--16x9"
                          // style="background: url('wp-content/uploads/2021/10/guide-detail-tis-the-season.png') center center;background-size: cover;"
                        ></div>

                        <div className="pt3 pb5 pb4-m pt4-l">
                          <p className="fw6 sg-jade-mid">Market Insights</p>
                          <h3 className="mb3 lh-title black">
                            [Exclusive report] Tis the Season (to be scalable) -
                            UK
                          </h3>

                          <p className="btn-ghost mb0 absolute b-1 l-0">
                            Download now
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section> */}

          <section className="get-connected bg-black">
            <div className="l-wrapper mw-82 pv4 pt5-l">
              <div className="white mw-600 center tc pv4">
                <h2 className="as-header-1 white">
                  <span id="Contact">Contact us Today</span>
                </h2>

                <p className="intro-text mb4 fw6">
                  Let’s build a more efficient, collaborative, and
                  client-focused future together
                </p>

                <a
                  href="#"
                  className="btn btn--std btn--orange fw6 js-form-reveal dib"
                >
                  Book a demo
                </a>
              </div>
            </div>
          </section>
        </main>

        <div className="m-slide-out-form bg-black js-slide-out-form">
          <div className="m-slide-out-form-inner mw-700 relative">
            <a
              href="#"
              className="white m-slide-out-form-close js-slide-out-form-close db"
            >
              <span className="dib v-mid">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 14.819 14.819"
                  width="22px"
                  height="22px"
                >
                  <title>cross</title>
                  <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                      <line
                        x1="1.01"
                        y1="1.01"
                        x2="13.808"
                        y2="13.808"
                        fill="none"
                        stroke="#ffffff"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.021"
                      />
                      <line
                        x1="13.808"
                        y1="1.01"
                        x2="1.01"
                        y2="13.808"
                        fill="none"
                        stroke="#ffffff"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.021"
                      />
                    </g>
                  </g>
                </svg>
              </span>
              <span className="hide-text dib v-mid">Close</span>
            </a>

            <h2 className="white">
              {" "}
              <span>
                {" "}
                See the benefits of Corpseed's Retail Operating System in action
              </span>
            </h2>
          </div>
        </div>
        <footer id="colophon" className="l-footer site-footer bg-black">
          <div className="l-wrapper mw-82 lh-copy">
            <div className="l-footer-inner">
              <div className="footer-row-1 flex-l flex-row-l">
                <div className="w-50-l pr4-l">
                  <div className="pv4 mb4 mt3-l br3">
                    <div className="m-footer-social pt4-l">
                      <div className="flex-l flex-row-l w-50-l pr4-l">
                        <div className="w-50-l mb4 mb0-l">
                          <h5 className="mb0 white">
                            <b>Follow Us</b>
                          </h5>
                          <ul className="list pl0 lh-copy my-4">
                            <li className="m-footer-social-icon dib v-mid pr2 mr-2">
                              <a
                                href="https://www.facebook.com/CorpseedGroup/"
                                target="_blank"
                                // className="facebook db hide-text hover-opacity"
                                data-wpel-link="external"
                                rel="external noopener noreferrer"
                              >
                                <div style={{ height: "auto", width: "45px" }}>
                                  <img src={facebook} />
                                </div>
                              </a>
                            </li>
                            <li className="m-footer-social-icon dib v-mid pr2 mr-2">
                              <a
                                href="https://www.instagram.com/corpseed/"
                                target="_blank"
                                // className="facebook db hide-text hover-opacity"
                                data-wpel-link="external"
                                rel="external noopener noreferrer"
                              >
                                <div style={{ height: "auto", width: "45px" }}>
                                  <img src={instagram} />
                                </div>
                              </a>
                            </li>
                            <li className="m-footer-social-icon dib v-mid pr2 mr-2">
                              <a
                                href="https://x.com/corpseed"
                                target="_blank"
                                // className="twitter db hide-text hover-opacity white"
                                data-wpel-link="external"
                                rel="external noopener noreferrer"
                              >
                                <div style={{ height: "auto", width: "35px" }}>
                                  <img src={twitterX} />
                                </div>
                              </a>
                            </li>
                            <li className="m-footer-social-icon dib v-mid pr2 mr-2">
                              <a
                                href="https://in.linkedin.com/company/corpseed"
                                target="_blank"
                                // className="linkedin db hide-text hover-opacity white"
                                data-wpel-link="external"
                                rel="external noopener noreferrer"
                              >
                                <div style={{ height: "auto", width: "35px" }}>
                                  <img src={linkedin} />
                                </div>
                              </a>
                            </li>
                            <li className="m-footer-social-icon dib v-mid pr2 mr-2">
                              <a
                                href="https://www.youtube.com/@CorpSeed"
                                target="_blank"
                                // className="youtube db hide-text hover-opacity white"
                                data-wpel-link="external"
                                rel="external noopener noreferrer"
                              >
                                <div style={{ height: "auto", width: "45px" }}>
                                  <img src={youtube} />
                                </div>
                              </a>
                            </li>
                            <li className="m-footer-social-icon dib v-mid">
                              <a
                                href="https://in.pinterest.com/corpseed/"
                                target="_blank"
                                // className="youtube db hide-text hover-opacity white"
                                data-wpel-link="external"
                                rel="external noopener noreferrer"
                              >
                                <div style={{ height: "auto", width: "40px" }}>
                                  <img src={pintrest} />
                                </div>
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-50-l pl5-l mb4 mb0-l">
                  <div className="flex-m flex-row-m pt4-l">
                    <div className="w-100 w-50-m w-33-l ph2-l" style={{display:"flex",justifyContent:'flex-end'}}>
                      <div className="white f5 ">
                        <h2 className="mt3 o-7 h2-uppercase white">Company</h2>

                        <ul className="list pl0 lh-copy">
                          <li className="pt4-ns pt2 pb2">
                            <a
                              href="http://www.corpseed.com"
                              className="link"
                              data-wpel-link="internal"
                            >
                              Corpseed history
                            </a>
                          </li>
                          <li className="pb2">
                            <a
                             href="http://www.corpseed.com"
                              className="link"
                              data-wpel-link="internal"
                            >
                              Opportunities
                            </a>
                          </li>
                          
                        </ul>
                      </div>
                    </div>

                    {/* <div className="w-100 w-50-m w-33-l ph2-m">
                      <div className="white f5 ">
                        <h2 className="mt3 o-7 h2-uppercase white">
                          Partner Services
                        </h2>

                        <ul className="list pl0 lh-copy">
                          <li className="pt4-ns pt2 pb2">
                            <a
                              href="partners.html"
                              className="link"
                              data-wpel-link="internal"
                            >
                              Find a partner
                            </a>
                          </li>
                          <li className="pb2">
                            <a
                              href="become-a-partner.html"
                              className="link"
                              data-wpel-link="internal"
                            >
                              Become a partner
                            </a>
                          </li>
                          <li className="pb2">
                            <a
                              href="refer-a-customer.html"
                              className="link"
                              data-wpel-link="internal"
                            >
                              Refer a customer
                            </a>
                          </li>
                          <li className="pb2">
                            <a
                              href="partners/index.html#partner-resources"
                              className="link"
                              data-wpel-link="internal"
                            >
                              Partner resources
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div> */}

                    {/* <div className="w-100 w-50-m w-33-l ph2-m">
                      <div className="white f5">
                        <h2 className="h2-uppercase mt3 o-7 white">Support</h2>
                        <ul className="list pl0 lh-copy">
                          <li className="pt4-ns pt2 pb2">
                            <a
                              href="https://help.brightpearl.com/s/"
                              className="link"
                              target="_blank"
                              data-wpel-link="external"
                              rel="external noopener noreferrer"
                            >
                              Knowledge Center
                            </a>
                          </li>
                          <li className="pb2">
                            <a
                              href="https://api-docs.brightpearl.com/"
                              className="link"
                              target="_blank"
                              data-wpel-link="external"
                              rel="external noopener noreferrer"
                            >
                              API
                            </a>
                          </li>
                          <li className="pb2">
                            <a
                              href="contact-us.html"
                              className="link"
                              data-wpel-link="internal"
                            >
                              Get in touch
                            </a>
                          </li>
                          <li className="pb2">
                            <a
                              href="contact-support.html"
                              className="link"
                              data-wpel-link="internal"
                            >
                              Contact Support
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>

              <div className="footer-row-3 pt4 pt5-l">
                <div className="flex-l flex-row-l">
                  <div className="w-50-l pr5-l">
                    <p className="white">
                      &copy; Corpseed Copyright 2024 All rights reserved
                    </p>
                  </div>

                  {/* <div className="w-50-l pl5-l pr4-l flex-l flex-row-l justify-between-l">
                    <a
                      href="privacy-policy.html"
                      className="db dib-m link white pr3-m"
                      data-wpel-link="internal"
                    >
                      Privacy policy
                    </a>
                    <a
                      href="our-cookie-policy.html"
                      className="db dib-m link white ph3-m"
                      data-wpel-link="internal"
                    >
                      Cookie policy
                    </a>
                    <a
                      href="customer-terms.html"
                      className="db dib-m link white ph3-m"
                      data-wpel-link="internal"
                    >
                      Customer Terms
                    </a>
                    <a
                      href="security.html"
                      className="db dib-m link white ph3-m"
                      data-wpel-link="internal"
                    >
                      Security
                    </a>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
