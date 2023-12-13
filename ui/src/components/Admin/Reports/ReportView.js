import { useContext, useEffect, useState } from "react";
import classes from "./ReportView.module.css";
import { ReportsContext } from "../../../services/Reports/Reports.context";

import {
  Autocomplete,
  Box,
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
import { useNavigate, useSearchParams } from "react-router-dom";
import _, { attempt } from "lodash";
import {
  formatTimeWithSeconds,
  scrollToElement,
  scrollToTop,
} from "../../../utility/helper";
import {
  NotFoundContainer,
  NotFoundContainerImage,
  NotFoundText,
} from "../../../styles";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import moment from "moment";
import ReportViewInfo from "./ReportViewInfo";

const filters = [
  {
    value: "pass",
    label: "Pass",
  },
  {
    value: "fail",
    label: "Fail",
  },
];

const ReportView = ({ title }) => {
  const { onGetQuizReport } = useContext(ReportsContext);
  const [report, setReport] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [orgReport, setOrgReport] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [orgAttempts, setOrgAttempts] = useState([]);

  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterBy, setFilterBy] = useState(null);

  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    document.title = title;
  }, []);

  useEffect(() => {
    scrollToTop();
    let reportId = searchParams.get("id");
    if (!reportId) {
      navigate("/dashboard/reports");
      return;
    }
    if (reportId) {
      onGetQuizReport(
        reportId,
        (result) => {
          let reportData = result.report;
          console.log(reportData);
          if (!reportData) {
            return;
          }
          document.title = `View Report | ${reportData.name}`;
          setReport(reportData);
          setOrgReport(reportData);
          setAttempts(reportData.attempts);
          setOrgAttempts(reportData.attempts);
        },
        () => {
          navigate("/dashboard/reports");
        },
        true,
        false
      );
    }
  }, []);

  const onChangeSearchKeyword = (e) => {
    let value = e.target.value;
    setSearchKeyword(value);
    let filtered = orgAttempts;
    let finalAttempts = _.cloneDeep(orgAttempts);
    if (filterBy && filterBy.value) {
      finalAttempts = finalAttempts.filter((a) => a.result === filterBy.value);
    }
    if (value) {
      value = value.toLowerCase();
      filtered = finalAttempts.filter((attempt) => {
        let { user } = attempt;
        let { firstName, lastName, email } = user;
        let firstNameFound = firstName.toLowerCase().includes(value);
        let lastNameFound = lastName?.toLowerCase().includes(value);
        let emailFound = email?.toLowerCase().includes(value);

        return firstNameFound || lastNameFound || emailFound;
      });
    } else if (!value) {
      filtered = finalAttempts;
    }
    setAttempts(filtered);
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
    var currentAttempts = attempts;
    let type = sort.type === "asc" ? "desc" : "asc";
    let fields = ["user.email", "percentage", "marksObtained"];
    if (fields.includes(fieldToSort)) {
      let sortedAttempts = _.orderBy(currentAttempts, fieldToSort, type);
      setSort((p) => ({
        ...p,
        type: type,
        field: fieldToSort,
      }));
      setAttempts(sortedAttempts);
    }
  };

  const onFilterValueChange = (newValue) => {
    setFilterBy(newValue);
    setSearchKeyword("");
    setPage(0);
    if (newValue && newValue.value) {
      let value = newValue.value;
      let currentAttempts = _.cloneDeep(orgAttempts);
      let finalAttempts = [];
      finalAttempts = currentAttempts.filter((a) => a.result === value);

      setAttempts(finalAttempts);
    } else {
      setAttempts(orgAttempts);
    }
  };

  const onSelectAttempt = (data) => {
    setAttempt(data);
    setTimeout(() => {
      scrollToElement("reviewInfo", 200);
    }, 500);
  };

  return report ? (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Report - {report.name}</h2>
      </Box>

      {orgAttempts && orgAttempts.length > 0 && (
        <div className={classes.searchContainer}>
          <TextField
            margin="normal"
            id="search"
            sx={{
              width: "30%",
            }}
            variant="standard"
            label="Search By Keyword"
            name="search"
            value={searchKeyword}
            onChange={onChangeSearchKeyword}
          />

          <Autocomplete
            disablePortal
            className="mt-1"
            options={filters}
            sx={{
              minWidth: 250,
            }}
            value={filterBy || null}
            onChange={(e, newValue) => {
              onFilterValueChange(newValue);
            }}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField {...params} label="Filter By " />
            )}
          />
        </div>
      )}

      {attempts.length === 0 && (
        <NotFoundContainer>
          <div>
            <NotFoundText>No Attempts Found</NotFoundText>
            <NotFoundContainerImage
              src={require("../../../assets/no_data.png")}
              alt="..."
            />
          </div>
        </NotFoundContainer>
      )}

      {attempts.length > 0 && (
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
                    onClick={() => onChangeSorting("user.email")}
                  >
                    Email Address
                  </TableSortLabel>
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>
                  {" "}
                  <TableSortLabel
                    direction={
                      sort.type && sort.type === "desc" ? "asc" : "desc"
                    }
                    active
                    onClick={() => onChangeSorting("marksObtained")}
                  >
                    Marks Obtained
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  {" "}
                  <TableSortLabel
                    direction={
                      sort.type && sort.type === "desc" ? "asc" : "desc"
                    }
                    active
                    onClick={() => onChangeSorting("percentage")}
                  >
                    Percentage
                  </TableSortLabel>
                </TableCell>
                <TableCell>Time Taken</TableCell>
                <TableCell>Completed On </TableCell>
                <TableCell>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? attempts.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : attempts
              ).map((attempt, index) => {
                let {
                  _id,
                  user,
                  percentage,
                  marksObtained,
                  timeSpentInSeconds,
                  submittedOn,
                  result,
                } = attempt;
                let { totalMarks, dueDate } = attempt.quiz;
                let { email, firstName, lastName } = user;
                let lateSubmission = moment(submittedOn).isAfter(dueDate);
                let isPass = result === "pass";

                return (
                  <TableRow
                    onClick={() => onSelectAttempt(attempt)}
                    key={_id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      ":hover": {
                        background: "rgba(95, 45, 237, 0.2)",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {index + 1 + page * rowsPerPage}
                    </TableCell>
                    <TableCell>{email}</TableCell>
                    <TableCell>{`${firstName} ${lastName}`}</TableCell>
                    <TableCell>{`${marksObtained}/${totalMarks}`}</TableCell>
                    <TableCell>{`${percentage}%`}</TableCell>
                    <TableCell>
                      {formatTimeWithSeconds(timeSpentInSeconds)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: lateSubmission ? "red" : "green",
                      }}
                    >
                      {/* Wed, 02 Aug 2023 */}
                      {moment(submittedOn).format("ddd, DD MMM YYYY")}
                      <br />
                      {moment(submittedOn).format("hh:mm:ss A")}
                    </TableCell>
                    <TableCell>
                      <img
                        className={classes.resultImg}
                        src={require(`../../../assets/${
                          isPass ? "pass.png" : "fail.png"
                        }`)}
                        alt="..."
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 50, { label: "All", value: -1 }]}
                  count={attempts.length}
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
      <div id="reviewInfo">
        {attempt && <ReportViewInfo setAttempt={setAttempt} report={attempt} />}
      </div>
    </>
  ) : null;
};

export default ReportView;
