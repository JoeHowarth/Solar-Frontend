import React, { FC } from "react";
// import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import Menu from 'react-bulma-components/lib/components/menu'
import Box from 'react-bulma-components/lib/components/box'
import Image from 'react-bulma-components/lib/components/image'
import logo from "../solar_solve_logo1.png";

export const Base = props => (
    <Box className="mainContainer">
        <Link to="/">
            <Image size={128} src={logo} />
        </Link>
        {props.children}
    </Box>
);


const SolarMenu = () => (
    <Menu>
        <Menu.List>
            <li>
                <Link to="/new-query">New Query</Link>
            </li>
            <li>
                <Link to="history">History</Link>
            </li>
        </Menu.List>
    </Menu>
);

export default SolarMenu;