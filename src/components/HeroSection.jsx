// import EmailConfig from "./heroSection/EmailConfig";
import Upload from "./heroSection/Upload";
import DesignTemplate from "./heroSection/DesignTemplate";
// import React, { useState } from "react";
// import Navbar from "./Navbar";

export default function HeroSection() {
    // const [value, setValue] = useState(0);
    return(
        <div className="flex justify-around items-center" >
            <Upload/>
            <DesignTemplate/>
        </div>
    )
}