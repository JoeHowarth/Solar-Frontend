import React, { FC } from "react";
// import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Menu, MenuList, MenuLink, Image, Container, Box } from "bloomer";
import logo from "../solar_solve_logo1.png";

export const Base: FC<{}> = props => (
    <Box className="mainContainer">
        <Link to="/">
            <Image isSize="128x128" src={logo} />
        </Link>
        {props.children}
    </Box>
);

const SolarMenu = () => (
    <Menu>
        <MenuList>
            <li>
                <Link to="/new-query">New Query</Link>
            </li>
            <li>
                <Link to="history">History</Link>
            </li>
            <li>
                <Link to="edit-parameters">Edit Parameters</Link>
            </li>
        </MenuList>
    </Menu>
);

export default SolarMenu;
