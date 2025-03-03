import React, { useReducer, useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Collapse } from "react-bootstrap";
import { Link } from "react-router-dom";

import { getMenuList } from "./Menu";

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active: "",
  activeSubmenu: "",
};

const SideBar = () => {
  const [state, setState] = useReducer(reducer, initialState);
  const [menuList, setMenuList] = useState([]);

  useEffect(() => {
    const menu = getMenuList();
    setMenuList(menu);
  }, []);

  const d = new Date();

  const handleMenuActive = (status) => {
    setState({ active: status });
    if (state.active === status) {
      setState({ active: "" });
    }
  };

  const handleSubmenuActive = (status) => {
    setState({ activeSubmenu: status });
    if (state.activeSubmenu === status) {
      setState({ activeSubmenu: "" });
    }
  };

  // Path
  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];

  return (
    <div className={`deznav border-right fixed`}>
      <PerfectScrollbar className="deznav-scroll">
        <ul className="metismenu" id="menu">
          {menuList.map((data, index) => {
            let menuClass = data.classsChange;
            if (menuClass === "menu-title") {
              return (
                <li className={menuClass} key={`menu-title-${index}`}>
                  {data.title}
                </li>
              );
            } else {
              return (
                <li
                  className={` ${state.active === data.title ? "mm-active" : ""}`}
                  key={`menu-item-${index}`}
                >
                  {data.content && data.content.length > 0 ? (
                    <Link
                      to={"#"}
                      className="has-arrow"
                      onClick={() => {
                        handleMenuActive(data.title);
                      }}
                    >
                      {data.iconStyle}
                      {" "}
                      <span className="nav-text">
                        {data.title}
                        {data.update && data.update.length > 0 ? (
                          <span className="badge badge-xs badge-danger ms-2">
                            {data.update}
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                    </Link>
                  ) : (
                    <Link to={data.to}>
                      {data.iconStyle}
                      {" "}
                      <span className="nav-text">
                        {data.title}
                        {data.update && data.update.length > 0 ? (
                          <span className="badge badge-xs badge-danger ms-2">
                            {data.update}
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                    </Link>
                  )}
                  <Collapse in={state.active === data.title}>
                    <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                      {data.content &&
                        data.content.map((subData, subIndex) => {
                          return (
                            <li
                              key={`submenu-item-${index}-${subIndex}`}
                              className={`${
                                state.activeSubmenu === subData.title ? "mm-active" : ""
                              }`}
                            >
                              {subData.content && subData.content.length > 0 ? (
                                <>
                                  <Link
                                    to={subData.to}
                                    className={subData.hasMenu ? "has-arrow" : ""}
                                    onClick={() => {
                                      handleSubmenuActive(subData.title);
                                    }}
                                  >
                                    {subData.title}
                                  </Link>
                                  <Collapse in={state.activeSubmenu === subData.title}>
                                    <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                                      {subData.content.map((childData, childIndex) => (
                                        <li
                                          key={`child-menu-item-${index}-${subIndex}-${childIndex}`}
                                        >
                                          <Link
                                            className={`${
                                              path === childData.to ? "mm-active" : ""
                                            }`}
                                            to={childData.to}
                                          >
                                            {childData.title}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </Collapse>
                                </>
                              ) : (
                                <Link to={subData.to}>{subData.title}</Link>
                              )}
                            </li>
                          );
                        })}
                    </ul>
                  </Collapse>
                </li>
              );
            }
          })}
        </ul>
    
        <div className="copyright">
          <p className="fs-13 font-w200">
            <strong className="font-w400">SmartScan</strong> ©{" "}
            {d.getFullYear()} All Rights Reserved
          </p>
        </div>
      </PerfectScrollbar>
    </div>
  );
};

export default SideBar;