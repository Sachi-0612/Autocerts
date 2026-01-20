import React from "react";
import { useState } from "react";

export default function Upload() {

    const [active, setActive] = useState(0);
    const base = "mx-1 py-2 px-3 font-medium rounded-lg hover:opacity-80";
    const activeClass = `${base} bg-black text-white`;
    const inactiveClass = `${base} bg-white text-black border border-gray-300`;
    return(
        <div className="w-1/2 m-5 bg-white p-3.5 rounded-2xl border border-gray-300 ">
            <h3 className="text-lg font-medium">Document Type</h3>
            <div className="my-2.5">
                <ul className="flex justify-start">
                    <li className={`${active===0 ? activeClass:inactiveClass}`}><button
                    onClick={() => setActive(0)}>Certificate</button></li>
                    <li className={`${active===1 ? activeClass:inactiveClass}`}><button
                    onClick={() => setActive(1)}>ID Card</button></li>
                </ul>
            </div>
            {active === 0 ? (
  <div className="h-90 flex items-center justify-center gap-4 border-2 border-dashed border-gray-300 rounded-lg px-4">
    {/* <h5 className="text-gray-600 font-normal whitespace-nowrap"> */}
      {/* Upload your excel file: required columns are Name, Email, any other */}
    {/* </h5> */}
    <input
      className="hidden"
      type="file"
      id="excel"
    />

    <label htmlFor="excel"
            className="px-4 py-2 bg-black text-white rounded-xl font-medium cursor-pointer hover:opacity-80">
        Choose File
            </label>
  </div>
) : (
  <div className="h-90 flex items-center justify-center gap-4 border-2 border-dashed border-gray-300 rounded-lg px-4">
    {/* <h5 className="text-gray-600 font-normal whitespace-nowrap">
      Upload your excel file: required columns are Name, Email, photo
    </h5> */}

    {/* Hidden file input */}
    <input type="file" id="excel" className="hidden" />

    {/* Styled trigger button */}
    <label
      htmlFor="excel"
      className="px-4 py-2 bg-black text-white rounded-xl font-medium cursor-pointer hover:opacity-80"
    >
      Choose File
    </label>
  </div>
)}
    </div>
    )}