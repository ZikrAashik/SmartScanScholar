import React from "react";

import { Link } from "react-router-dom";

import LogoutPage from "./Logout";
import avatar from "../assets/images/avatar.png";
import { Dropdown } from "react-bootstrap";


const Header = () => {
	const userDetails = JSON.parse(sessionStorage.getItem('user'));

	const fullName = userDetails ? `${userDetails.firstname} ${userDetails.lastname}` : '';

  var path = window.location.pathname.split("/");
  var name = path[path.length - 1].split("-");
  var filterName = name.length >= 3 ? name.filter((n, i) => i > 0) : name;
  var finalName = filterName.includes("page")
    ? filterName.filter((f) => f !== "page")
    : filterName.includes("email")
    ? filterName.filter((f) => f !== "email")
    : filterName.includes("ecom")
    ? filterName.filter((f) => f !== "ecom")
    : filterName.includes("chart")
    ? filterName.filter((f) => f !== "chart")
    : filterName.includes("editor")
    ? filterName.filter((f) => f !== "editor")
    : filterName;
  return (
    <div className="header">
		<div className="header-content">
			<nav className="navbar navbar-expand">
				<div className="collapse navbar-collapse justify-content-between">
					<div className="header-left">
						<div
							className="dashboard_bar"
							style={{ textTransform: "capitalize" }}
						  >
							{finalName.join(" ").length === 0
							  ? "Dashboard"
							  : finalName.join(" ")}
						</div>
					</div> 	
					<ul className="navbar-nav header-right">					
						<Dropdown as="li" className="nav-item header-profile ">
							<Dropdown.Toggle as="a" to="#" variant="" className="nav-link i-false c-pointer">								
								<img src={avatar} width="20" alt=""/>
								<div className="header-info">
									<span>{fullName}<i className="fa fa-caret-down ms-3" aria-hidden="true"></i></span>
								</div>
                                
							</Dropdown.Toggle>
							<Dropdown.Menu align="right" className="mt-2">						
                               <LogoutPage />
							</Dropdown.Menu>
						</Dropdown>
					</ul>
				</div>
			</nav>
		</div>
    </div>
  );
};

export default Header;
