import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";

export function NavMenuToggle(){
    setTimeout(()=>{    
        let mainwrapper = document.querySelector("#main-wrapper");
        if(mainwrapper.classList.contains('menu-toggle')){
            mainwrapper.classList.remove("menu-toggle");
        }else{
            mainwrapper.classList.add("menu-toggle");
        }
    },200);
}

const NavHader = ({ menuToggle, setMenuToggle }) => {
   return (
      <div className="nav-header">
         <Link to="." className="brand-logo">
            <img className="brand-title" src={logo} alt="" />   
         </Link>

         <div className="nav-control" 
            onClick={() => {
                setMenuToggle(!menuToggle);
                NavMenuToggle();
            }}
        >
            <div className={`hamburger ${menuToggle ? "is-active" : ""}`}>
               <span className="line"></span>
               <span className="line"></span>
               <span className="line"></span>
            </div>
         </div>
      </div>
   );
};

export default NavHader;