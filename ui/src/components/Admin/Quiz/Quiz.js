/* eslint-disable react/jsx-no-duplicate-props */
import { useContext, useEffect, useState } from "react";
import {
  NotFoundContainer,
  NotFoundContainerImage,
  NotFoundText,
} from "../../../styles";
import CheckIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Button,
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
import EditIcon from "@mui/icons-material/Edit";
import { FaPlus } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import _ from "lodash";
import Swal from "sweetalert2";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import classes from "./Quiz.module.css";

import { SocketContext } from "../../../services/Socket/Socket.context";
import { QuizContext } from "../../../services/Quiz/Quiz.context";
import CreateEditQuiz from "./CreateEditQuiz";
import { formatTime } from "../../../utility/helper";

const Quiz = ({ title }) => {
  const { onGetQuizes, onDeleteQuiz } = useContext(QuizContext);

  const { socket, onFetchEvent, onEmitEvent } = useContext(SocketContext);
  const [quizes, setQuizes] = useState([]);

  const [orgQuizes, setOrgQuizes] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const location = useLocation();
  const [mode, setMode] = useState(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = title;
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get("mode");
    if (mode) {
      setMode(mode);
    } else {
      getQuizes();
    }
  }, [location.search]);

  useEffect(() => {
    if (socket) {
      const eventHandler = (data) => {
        getQuizes();
      };
      onFetchEvent("refreshQuiz", eventHandler);
      return () => {
        socket?.off("refreshQuiz", eventHandler);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFetchEvent, socket]);

  const getQuizes = () => {
    onGetQuizes(
      (result) => {
        setLoading(false);
        if (result && result.quizes) {
          setQuizes(result.quizes);
          setOrgQuizes(result.quizes);
        }
      },
      true,
      false
    );
  };

  const onChangeSearchKeyword = (e) => {
    let value = e.target.value;
    setSearchKeyword(value);
    let filtered = orgQuizes;
    if (value) {
      value = value.toLowerCase();
      let finalQuizes = _.cloneDeep(orgQuizes);
      filtered = finalQuizes.filter((batch) => {
        let { name, totalMarks } = batch;
        let nameFound = name.toLowerCase().includes(value);
        let totalMarksFound = totalMarks?.toString().includes(value);

        return nameFound || totalMarksFound;
      });
    }
    setQuizes(filtered);
  };

  const onClickEditQuiz = (batch) => {
    navigate("?mode=edit&id=" + batch._id);
  };

  const onClickDeleteBatch = (quiz) => {
    Swal.fire({
      title: "Are you sure to delete?",
      text: `${quiz.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteQuiz(quiz._id, (result) => {
          onEmitEvent("refreshQuiz");
        });
      }
    });
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
    var currentQuizes = quizes;
    let type = sort.type === "asc" ? "desc" : "asc";
    let fields = ["name", "totalMarks"];
    if (fields.includes(fieldToSort)) {
      let sortedQuizes = _.orderBy(currentQuizes, fieldToSort, type);
      setSort((p) => ({
        ...p,
        type: type,
        field: fieldToSort,
      }));
      setQuizes(sortedQuizes);
    }
  };

  return (
    <section>
      {!mode && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2>Quizes - {orgQuizes.length}</h2>
            <Link to={"?mode=create"}>
              <Button variant="contained" startIcon={<FaPlus />}>
                Add New Quiz
              </Button>
            </Link>
          </Box>

          {orgQuizes && orgQuizes.length > 0 && (
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

          {quizes.length === 0 && !loading && (
            <NotFoundContainer>
              <div>
                <NotFoundText>No Quizes Found</NotFoundText>
                <NotFoundContainerImage
                  src={require("../../../assets/no_data.png")}
                  alt="..."
                />
              </div>
            </NotFoundContainer>
          )}

          {quizes.length > 0 && (
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
                        NAME
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Total Marks</TableCell>
                    <TableCell>Available To</TableCell>
                    <TableCell>Time Limit</TableCell>
                    <TableCell>No Of Questions</TableCell>
                    <TableCell>Students Attempted</TableCell>
                    <TableCell>Available & Due Dates </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? quizes.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : quizes
                  ).map((quiz, index) => {
                    let {
                      name,
                      totalMarks,
                      availableToEveryone,
                      availableTo,
                      timeLimit,
                      timeLimitEnabled,
                      questions,
                      quizAttempts,
                      availableFrom,
                      availableUntil,
                      dueDate,
                      _id,
                      createdAt,
                    } = quiz;

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
                        <TableCell>{name}</TableCell>
                        <TableCell>{totalMarks}</TableCell>
                        <TableCell>
                          {availableToEveryone
                            ? "Everyone"
                            : availableTo.length}
                        </TableCell>
                        <TableCell>
                          {timeLimitEnabled
                            ? `${formatTime(timeLimit)}`
                            : "No Time Limit"}
                        </TableCell>
                        <TableCell>{questions.length}</TableCell>
                        <TableCell>{quizAttempts.length}</TableCell>

                        <TableCell>
                          <div className={classes.datesContainer}>
                            <div>
                              <p>Available From - </p>
                              <p>Available To - </p>
                              {dueDate && <p>Due Date - </p>}
                              <p>Created At - </p>
                            </div>
                            <div>
                              <p>
                                {moment(availableFrom).format(
                                  "MMM DD, YYYY - hh:mm A"
                                )}
                              </p>
                              <p>
                                {moment(availableUntil).format(
                                  "MMM DD, YYYY - hh:mm A"
                                )}
                              </p>
                              {dueDate && (
                                <p>
                                  {moment(dueDate).format(
                                    "MMM DD, YYYY - hh:mm A"
                                  )}
                                </p>
                              )}

                              <p>
                                {moment(createdAt).format(
                                  "MMM DD, YYYY - hh:mm A"
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <IconButton
                            onClick={() => onClickEditQuiz(quiz)}
                            aria-label="edit"
                            color="info"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => onClickDeleteBatch(quiz)}
                            aria-label="delete"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>{" "}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[
                        10,
                        20,
                        50,
                        { label: "All", value: -1 },
                      ]}
                      count={quizes.length}
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
      )}
      {mode && <CreateEditQuiz mode={mode} />}
    </section>
  );
};

export default Quiz;
