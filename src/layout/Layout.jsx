import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Aside from "./aside/Aside";
import Footer from "./footer/Footer";
import Header from "./header/Header";


/**
 * layout component to generate our basic layout of our application
 * @returns {void}
 */
function Layout() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="h-full w-full flex transition-all">
      <Aside expanded={expanded} setExpanded={setExpanded} />
      <div
        className={`${
          expanded ? "sm:pl-44" : "sm:pl-16"
        } flex flex-col h-full w-full p-4`}
      >
        <Header/>
        <div className={` h-full w-full `}>
          <Routes>
            <Route
              path="/"
              element={
                <div className="h-full w-full bg-background">Dashboard</div>
              }
            />
            <Route path="/other" element={<div>other</div>} />
          </Routes>
        </div>
       <Footer/>
      </div>
    </div>
  );
}

export default Layout;
