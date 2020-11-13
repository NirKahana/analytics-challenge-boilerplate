import React from "react";
import { Interpreter } from "xstate";
import { makeStyles } from '@material-ui/core/styles';

import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import Map from "../components/Map" 
import ByDaysChart from "../components/ByDaysChart" 


const useStyles = makeStyles({
  container: {
    // display: "flex"
  },
});
export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.container}>
        <Map />
        <ByDaysChart />
      </div>
    </>
  );
};

export default DashBoard;
