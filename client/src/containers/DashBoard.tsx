import React from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import { makeStyles } from '@material-ui/core/styles';
import ByDaysChart from "components/ByDaysChart";
import ByHoursChart from "components/ByHoursChart";
import Map from "components/Map";

const useStyles = makeStyles({
  container: {
    display: "flex"
  },
});
export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  const classes = useStyles();
  return (
    <>
      <Map />
      <ByDaysChart />
      <ByHoursChart />
    </>
  );
};

export default DashBoard;
