import React, { Fragment, useState } from "react";
import SideBar from "./SideBar";
import NavHader from "./NavHader";
import Header from "./Header";

const Nav = ({ title, onClick: ClickToAddEvent, onClick2, onClick3 }) => {
   const [toggle, setToggle] = useState("");
   const onClick = (name) => setToggle(toggle === name ? "" : name);
   return (
      <Fragment>
         <NavHader />
         <SideBar onClick={() => onClick2()} onClick3={() => onClick3()} />
         <Header
            onNotification={() => onClick("notification")}
            onProfile={() => onClick("profile")}
            toggle={toggle}
            title={title}
            onBox={() => onClick("box")}
            onClick={() => ClickToAddEvent()}
         />
      </Fragment>
   );
};

export default Nav;
