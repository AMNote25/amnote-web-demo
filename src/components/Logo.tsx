import React from "react"
import logo from "../assets/AMnote_logo.svg"

const Logo: React.FC = () => (
  <div className="mx-auto h-20 w-40 flex items-center justify-center">
    <img
      src={logo}
      alt="Logo"
      className=" object-contain bg-transparent"
    />
  </div>
)

export default Logo