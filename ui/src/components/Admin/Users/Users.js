/* eslint-disable react/jsx-no-duplicate-props */
import { useContext, useEffect, useState } from "react";
import {
  NotFoundContainer,
  NotFoundContainerImage,
  NotFoundText,
} from "../../../styles";
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
import { SocketContext } from "../../../services/Socket/Socket.context";
import { UsersContext } from "../../../services/users/users.context";
import CreateEditUser from "./CreateEditUser";
import { defaultRoles } from "../../../utility/helper";

const Users = ({ title }) => {
  const { onGetUsers, onDeleteUser } = useContext(UsersContext);
  const { socket, onFetchEvent, onEmitEvent } = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [orgUsers, setOrgUsers] = useState([]);
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
      getUsers();
    }
  }, [location.search]);

  useEffect(() => {
    if (socket) {
      const eventHandler = (data) => {
        getUsers();
      };
      onFetchEvent("refreshUsers", eventHandler);
      return () => {
        socket?.off("refreshUsers", eventHandler);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFetchEvent, socket]);

  const getUsers = () => {
    onGetUsers(
      (result) => {
        setLoading(false);
        if (result && result.users) {
          setUsers(result.users);
          setOrgUsers(result.users);
        }
      },
      true,
      false
    );
  };

  const onChangeSearchKeyword = (e) => {
    let value = e.target.value;
    setSearchKeyword(value);
    let filtered = orgUsers;
    if (value) {
      value = value.toLowerCase();
      let finalUsers = _.cloneDeep(orgUsers);
      filtered = finalUsers.filter((batch) => {
        let { firstName, lastName, email, role } = batch;
        let firstNameFound = firstName.toLowerCase().includes(value);
        let lastNameFound = lastName?.toLowerCase().includes(value);
        let emailFound = email?.toLowerCase().includes(value);
        let roleFound = role?.toLowerCase().includes(value);

        return firstNameFound || lastNameFound || emailFound || roleFound;
      });
    }
    setUsers(filtered);
  };

  const onClickEditUser = (user) => {
    navigate("?mode=edit&id=" + user._id);
  };

  const onClickDeleteUser = (user) => {
    Swal.fire({
      title: "Are you sure to delete?",
      text: `${user.firstName} - ${user.lastName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteUser(user._id, (result) => {
          onEmitEvent("refreshUsers");
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
    var currentUsers = users;
    let type = sort.type === "asc" ? "desc" : "asc";
    let fields = ["email"];
    if (fields.includes(fieldToSort)) {
      let sortedUsers = _.orderBy(currentUsers, fieldToSort, type);
      setSort((p) => ({
        ...p,
        type: type,
        field: fieldToSort,
      }));
      setUsers(sortedUsers);
    }
  };

  const getBatchNames = (user) => {
    if (user?.batches?.length > 0) {
      let batches = user.batches.map((b) => {
        return `${b.name} - ${b.code}`;
      });
      return batches.join(", ");
    } else {
      return " ------ ";
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
            <h2>Users - {orgUsers.length}</h2>
            <Link to={"?mode=create"}>
              <Button variant="contained" startIcon={<FaPlus />}>
                Add User
              </Button>
            </Link>
          </Box>

          {orgUsers && orgUsers.length > 0 && (
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

          {users.length === 0 && !loading && (
            <NotFoundContainer>
              <div>
                <NotFoundText>No Users Found</NotFoundText>
                <NotFoundContainerImage
                  src={require("../../../assets/no_data.png")}
                  alt="..."
                />
              </div>
            </NotFoundContainer>
          )}

          {users.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 4 }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>S.NO</TableCell>
                    <TableCell>Name </TableCell>
                    <TableCell>
                      {" "}
                      <TableSortLabel
                        direction={
                          sort.type && sort.type === "desc" ? "asc" : "desc"
                        }
                        active
                        onClick={() => onChangeSorting("email")}
                      >
                        Email
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Role </TableCell>
                    <TableCell>Batches</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? users.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : users
                  ).map((user, index) => {
                    let { firstName, lastName, email, _id, role, createdAt } =
                      user;
                    role = defaultRoles.find((r) => r.value === role);

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
                        <TableCell>{`${firstName} ${lastName}`}</TableCell>
                        <TableCell>{email}</TableCell>
                        <TableCell>
                          <strong>{role.label}</strong>
                        </TableCell>
                        <TableCell>{getBatchNames(user)}</TableCell>

                        <TableCell>
                          {moment(createdAt).format("MMM DD, YYYY - hh:mm A")}
                        </TableCell>

                        <TableCell>
                          <IconButton
                            onClick={() => onClickEditUser(user)}
                            aria-label="edit"
                            color="info"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => onClickDeleteUser(user)}
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
                      count={users.length}
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
      {mode && <CreateEditUser mode={mode} />}
    </section>
  );
};

export default Users;
