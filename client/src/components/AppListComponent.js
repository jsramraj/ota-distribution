import React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import IconButton from "@mui/material/IconButton";
import AddButton from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import "./AppListComponent.css";
import { Button } from "@mui/material";

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const openAppInNewTab = (app) => {
  console.log(app);
  window.open(`/apps/${app._id}`, "_blank");
};

const onUploadButtonClicked = () => {
  window.location.href = "apps/upload";
};

export default function AppList({}) {
  const [loading, setLoading] = React.useState(true);
  const [appData, setAppData] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/apps")
      .then((res) => res.json())
      .then((data) => {
        setAppData(data);
        console.log(appData);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log(loading);
        setLoading(false);
      });
  }, []);

  return loading ? (
    <b>Loading...</b>
  ) : (
    <Paper class="paper">
      <Button
        variant="contained"
        startIcon={<AddButton />}
        style={{ float: "right", margin: 10 }}
        onClick={() => onUploadButtonClicked()}
      >
        Upload
      </Button>
      <TableContainer component={Paper}>
        <Table stickyHeader sx={{ minWidth: 300 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <HeaderTableCell>Icon</HeaderTableCell>
              <HeaderTableCell>App Name</HeaderTableCell>
              <HeaderTableCell>Bundle Identifier</HeaderTableCell>
              <HeaderTableCell>Version</HeaderTableCell>
              <HeaderTableCell>Created Date</HeaderTableCell>
              <HeaderTableCell>Actions</HeaderTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appData?.map((app) => (
              <TableRow hover key={app.name} sx={{ "td, th": { border: 0 } }}>
                <TableCell align="center">
                  <img
                    src={app.icon}
                    alt={app.name}
                    style={{
                      height: 50,
                      width: 50,
                      marginTop: 1.5,
                      borderRadius: 7,
                    }}
                  />
                </TableCell>
                <TableCell align="left" component="th" scope="app">
                  {app.name}
                </TableCell>
                <TableCell align="left">{app.bundleId}</TableCell>
                <TableCell align="left">
                  {app.version}.{app.build}
                </TableCell>
                <TableCell align="left">{app.createdAt}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={(event) => openAppInNewTab(app)}>
                    <OpenInNewOffIcon></OpenInNewOffIcon>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
