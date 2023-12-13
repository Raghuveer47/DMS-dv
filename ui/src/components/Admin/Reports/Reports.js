import { useContext, useEffect, useState } from "react";
import classes from "./Reports.module.css";
import { ReportsContext } from "../../../services/Reports/Reports.context";
import {
  NotFoundContainer,
  NotFoundContainerImage,
  NotFoundText,
} from "../../../styles";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import ViewIcon from "@mui/icons-material/RemoveRedEye";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";

const Reports = ({ title }) => {
  const { onGetReports } = useContext(ReportsContext);
  const [reports, setReports] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [orgReports, setOrgReports] = useState([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = title;
    getReports();
  }, []);

  const getReports = () => {
    onGetReports(
      (result) => {
        console.log(result);
        setLoading(false);
        setReports(result.reports);
        setOrgReports(result.reports);
      },
      () => {
        setLoading(false);
      },
      true,
      false
    );
  };

  const onChangeSearchKeyword = (e) => {
    let value = e.target.value;
    setSearchKeyword(value);
    let filtered = orgReports;
    if (value) {
      value = value.toLowerCase();
      let finalReports = _.cloneDeep(orgReports);
      filtered = finalReports.filter((report) => {
        let { name } = report;
        let nameFound = name.toLowerCase().includes(value);
        return nameFound;
      });
    }
    setReports(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [sort, setSort] = useState({
    type: "desc",
    field: null,
  });

  const onChangeSorting = (fieldToSort) => {
    var currentReports = reports;
    let type = sort.type === "asc" ? "desc" : "asc";
    let fields = ["name", "passPercentage", "failPercentage"];
    if (fields.includes(fieldToSort)) {
      let sortedReports = _.orderBy(currentReports, fieldToSort, type);
      setSort((p) => ({
        ...p,
        type: type,
        field: fieldToSort,
      }));
      setReports(sortedReports);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Reports - {orgReports.length}</h2>
      </Box>

      {orgReports && orgReports.length > 0 && (
        <TextField
          margin="normal"
          fullWidth
          id="search"
          variant="standard"
          label="Search By Keyword"
          name="search"
          value={searchKeyword}
          onChange={onChangeSearchKeyword}
        />
      )}

      {reports.length === 0 && !loading && (
        <NotFoundContainer>
          <div>
            <NotFoundText>No Reports Found</NotFoundText>
            <NotFoundContainerImage
              src={require("../../../assets/no_data.png")}
              alt="..."
            />
          </div>
        </NotFoundContainer>
      )}

      {reports.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>S.NO</TableCell>
                <TableCell>
                  {" "}
                  <TableSortLabel
                    direction={
                      sort.type && sort.type === "desc" ? "asc" : "desc"
                    }
                    active
                    onClick={() => onChangeSorting("name")}
                  >
                    Quiz Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Students Attempted</TableCell>
                <TableCell>
                  {" "}
                  <TableSortLabel
                    direction={
                      sort.type && sort.type === "desc" ? "asc" : "desc"
                    }
                    active
                    onClick={() => onChangeSorting("passPercentage")}
                  >
                    Pass Percentage
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  {" "}
                  <TableSortLabel
                    direction={
                      sort.type && sort.type === "desc" ? "asc" : "desc"
                    }
                    active
                    onClick={() => onChangeSorting("failPercentage")}
                  >
                    Fail Percentage
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? reports.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : reports
              ).map((report, index) => {
                let { _id, name, passPercentage, failPercentage, attempted } =
                  report;

                return (
                  <TableRow
                    key={_id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {index + 1 + page * rowsPerPage}
                    </TableCell>
                    <TableCell>{`${name}`}</TableCell>
                    <TableCell>{attempted}</TableCell>
                    <TableCell sx={{ color: "green" }}>
                      {passPercentage}%
                    </TableCell>

                    <TableCell sx={{ color: "red" }}>
                      {failPercentage}%
                    </TableCell>

                    <TableCell>
                      <IconButton
                        onClick={() => navigate(`view?id=${_id}`)}
                        aria-label="edit"
                        color="info"
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 50, { label: "All", value: -1 }]}
                  count={reports.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: {
                      "aria-label": "rows per page",
                    },
                    native: true,
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default Reports;
