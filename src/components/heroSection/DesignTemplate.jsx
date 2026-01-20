import React from "react";
import { useState } from "react";

export default function Upload() {  
    const [active, setActive] = useState(0);
    const base = "mx-1 py-2 px-3 font-medium rounded-lg hover:opacity-80";
    const activeClass = `${base} bg-black text-white`;
    const inactiveClass = `${base} bg-white text-black border border-gray-300`;
    return(
        <div className="w-1/2 m-5 bg-white p-3.5 rounded-2xl border border-gray-300 h-[65vh] md:w-full">
            <h3 className="text-lg font-medium px-3">Document Size</h3>
            <div className="flex my-3 px-3">
                <h4>Preset size</h4>
                <select name="preset size" id="size" defaultValue={"A4 landscape"}
                        className=" bg-gray-300 w-14/15 pl-2 py-1.5 block rounded-lg p-2 mx-2 px-6 ml-3 ">
                    <option value="A4 landscape">A4 landscape</option>
                    <option value="A4 portrait">A4 portrait</option>
                    <option value="ID Card">ID Card</option>
                    <option value="Custom">Custom</option>
                </select>
            </div>
            
            <div>
                <div className="flex justify-start">
                    <label htmlFor="width"
                    className="w-1/2 px-3.5">Width(px)</label>
                    <label htmlFor="height" className="w-1/2 px-3.5">Height(px)</label>
                </div>
                <div className="flex justify-between">
                <input type="number" name="width" id="width" min={1}  max={3000} value={0}
                className="bg-gray-300 rounded-lg px-3 py-1 m-3 w-1/2"    />
                <input type="number" name="height" id="height" min={1} max={3000} 
                 className="bg-gray-300 rounded-lg px-3 py-1 m-3 w-1/2"/> 
                </div>
            </div>
            <div className="my-4">
                <h3 className="font-medium pl-3 my-3">Upload Template Background</h3>
                <input type="file" id="template upload" name="template upload"  className="hidden"/>
                <label htmlFor="template upload"
                className="ml-2 text-blue-600 bg-blue-200 p-2 rounded-xl border border-blue-400 cursor-pointer "
                >Choose file</label>
            </div>
        </div>
    )}
    