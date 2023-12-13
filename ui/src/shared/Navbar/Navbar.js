/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import classes from "./Navbar.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthenticationContext } from "../../services/Authentication/Authentication.context";

const drawerWidth = 240;

function Navbar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const { onLogout } = useContext(AuthenticationContext);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const onClickLogout = () => {
    onLogout(() => {
      navigate("/auth/signin");
    });
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Quiz",
      path: "/student/quiz",
      active: ["/student/quiz", "/student/quiz/start"],
    },
    {
      name: "Reports",
      path: "/student/reports",
      active: ["/student/reports", "/student/reports/view"],
    },
    {
      name: "Contact",
      path: "/contact",
    },
    {
      name: "Logout",
      onClick: onClickLogout,
    },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Box>
        <img
          src={require("../../assets/logo.png")}
          alt="..."
          className={classes.navLogo}
        />
      </Box>
      <Divider />
      <List>
        {navItems.map((item, i) => {
          let { name, path, onClick, active } = item;
          let currentPath = pathname;
          let activePath =
            active && active.length > 0 ? active.includes(currentPath) : false;
          return (
            <ListItem
              key={i}
              disablePadding
              className={`${activePath ? classes.activeItem : ""}`}
            >
              <ListItemButton sx={{ textAlign: "center" }}>
                <ListItemText
                  primary={name}
                  onClick={onClick ? onClick : () => navigateTo(path)}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        component="nav"
        sx={{
          background: "#fff",
        }}
      >
        <Toolbar>
          <div className={classes.navToolbar}>
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <img
              src={require("../../assets/logo.png")}
              alt="..."
              className={classes.navLogoToolbar}
            />
          </div>

          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
            <img
              src={require("../../assets/logo.png")}
              alt="..."
              className={classes.navLogo}
            />
          </Box>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item, i) => {
              let { name, path, onClick, active } = item;
              let currentPath = pathname;
              let activePath =
                active && active.length > 0
                  ? active.includes(currentPath)
                  : false;
              return (
                <a
                  // href={path}
                  onClick={onClick ? onClick : () => navigateTo(path)}
                  key={i}
                  className={`${classes.item} ${
                    activePath ? classes.active : ""
                  }`}
                >
                  {name}
                </a>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}

Navbar.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Navbar;
