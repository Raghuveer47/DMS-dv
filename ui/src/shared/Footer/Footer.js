import { Button, Divider, Grid, TextField } from "@mui/material";
import classes from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={classes.footer}>
      <Grid container spacing={5}>
        <Grid item md={7}>
          <img
            src={require("../../assets/logo_white.png")}
            alt="..."
            className={classes.logo}
          />
        </Grid>

        <Grid item md={5}>
          <div className={classes.subscriptionContainer}>
            <input
              name="email"
              placeholder="Enter your email here"
              className={classes.input}
            />
            <Button variant="contained">SUBSCRIBE NOW</Button>
          </div>
        </Grid>
      </Grid>
      <Divider sx={{ my: 5, bgcolor: "#263447" }} />
    </footer>
  );
};

export default Footer;
