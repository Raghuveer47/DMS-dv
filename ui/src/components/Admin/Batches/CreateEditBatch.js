import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BatchesContext } from "../../../services/Batches/Batches.context";
import { UsersContext } from "../../../services/users/users.context";
import { FaUsersViewfinder } from "react-icons/fa6";
import _ from "lodash";

const errors = {
  nameRequired: "Batch name required",
  codeRequired: "Batch code required",
};

const commonInputFieldProps = {
  value: "",
  focused: false,
  error: false,
  errorMessage: "",
};

const defaultInputState = {
  name: {
    ...commonInputFieldProps,
  },
  code: {
    ...commonInputFieldProps,
  },

  id: {
    ...commonInputFieldProps,
  },
};

const CreateEditBatch = ({ mode }) => {
  const [batch, setBatch] = useState(null);
  const [inputs, setInputs] = useState(defaultInputState);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState([]);

  const [trainers, setTrainers] = useState([]);
  const { onCreateBatch, onGetBatch, onEditBatch } = useContext(BatchesContext);
  const { onGetGroupedUsersByRoles } = useContext(UsersContext);

  const navigate = useNavigate();

  useEffect(() => {
    getStudentsAndTrainers();
    if (mode) {
      let title = mode === "edit" ? "Edit Batch" : "Add New Batch";
      document.title = title;
    }
    if (mode === "edit") {
      let editId = searchParams.get("id");
      if (!editId) {
        navigate("/dashboard/batches");
        return;
      }
      if (editId) {
        onGetBatch(
          editId,
          (result) => {
            let batchData = result.batch;
            setBatch(batchData);
            if (batchData) {
              let { name, code, students, trainers, _id } = batchData;
              let selStudents = students.map((s) => s._id);
              let selTrainers = trainers.map((s) => s._id);
              setSelectedStudents(selStudents);
              setSelectedTrainers(selTrainers);

              setInputs((prevState) => ({
                ...prevState,
                name: {
                  ...commonInputFieldProps,
                  value: name,
                },
                code: {
                  ...commonInputFieldProps,
                  value: code,
                },
                id: {
                  value: _id,
                },
              }));
            } else {
              navigate("/dashboard/batches");
            }
          },
          () => {
            navigate("/dashboard/batches");
          },
          false,
          false
        );
      }
    }
  }, [mode]);

  const onValueChangeHandler = (e) => {
    const { name, value } = e.target;
    setInputs((prevState) => ({
      ...prevState,
      [name]: {
        ...prevState[name],
        error: false,
        errorMessage: "",
        value,
      },
    }));
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    let hadErrors = false;
    const setErrorMessage = (name, message) => {
      setInputs((prevState) => ({
        ...prevState,
        [name]: {
          ...prevState[name],
          error: true,
          errorMessage: message,
        },
      }));
      hadErrors = true;
    };
    const returnValue = (value) => {
      return typeof value === "string" ? value?.trim() : value;
    };
    let { name, code } = inputs;
    name = returnValue(name.value);
    code = returnValue(code.value);

    if (!name) {
      setErrorMessage("name", errors.nameRequired);
    }
    if (!code) {
      setErrorMessage("code", errors.codeRequired);
    }

    if (hadErrors) {
      return;
    }
    let data = {
      name: name,
      code: code,
      students: selectedStudents,
      trainers: selectedTrainers,
    };

    if (mode === "edit") {
      onEditBatch(inputs.id.value, data, () => {
        navigate("/dashboard/batches");
      });
    } else {
      onCreateBatch(data, () => {
        navigate("/dashboard/batches");
      });
    }
  };

  const getStudentsAndTrainers = () => {
    onGetGroupedUsersByRoles(
      (result) => {
        let data = result.data;
        if (data) {
          let trainers = data.trainers;
          let students = data.students;
          setTrainers(trainers);
          setStudents(students);
        }
      },
      false,
      false
    );
  };

  const onClickCheckbox = (role, userId) => {
    let users = role === "trainer" ? selectedTrainers : selectedStudents;
    let updatedUsers;
    if (users.includes(userId)) {
      updatedUsers = users.filter((id) => id !== userId);
    } else {
      updatedUsers = [...users, userId];
    }

    if (role === "trainer") {
      setSelectedTrainers(updatedUsers);
    } else {
      setSelectedStudents(updatedUsers);
    }
  };

  return (
    <section>
      <Card>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {mode === "create" ? "Add New Batch " : "Edit Batch"}
          </Typography>
          <br />
          <Box
            component="form"
            noValidate
            onSubmit={onSubmitForm.bind(this)}
            sx={{ mt: 2 }}
          >
            <Grid container spacing={2}>
              {/* for form */}

              {/* name */}
              <Grid item md={6}>
                <TextField
                  error={inputs.name.error}
                  helperText={inputs.name.errorMessage}
                  margin="normal"
                  placeholder="Enter Batch Name "
                  required
                  fullWidth
                  id="name"
                  label="Batch Name"
                  name="name"
                  value={inputs.name.value}
                  onChange={onValueChangeHandler}
                />
              </Grid>

              {/* code */}
              <Grid item md={6}>
                <TextField
                  required
                  inputProps={{
                    style: { textTransform: "uppercase" },
                  }}
                  error={inputs.code.error}
                  helperText={inputs.code.errorMessage}
                  margin="normal"
                  fullWidth
                  id="code"
                  label="Batch Code"
                  placeholder="Enter Batch Code"
                  name="code"
                  value={inputs.code.value}
                  onChange={onValueChangeHandler}
                />
              </Grid>

              <Grid item md={6}>
                {(!students || students.length === 0) && (
                  <>
                    <br />
                    <h1 style={{ textAlign: "center" }}>No Students Found</h1>
                  </>
                )}
                {students && students.length > 0 && (
                  <>
                    <h3>Selected Students - {selectedStudents.length} </h3>
                    <br />
                    {students.map((s, i) => {
                      let { email, _id, firstName, lastName } = s;
                      let label = email;
                      return (
                        <FormGroup key={i}>
                          <FormControlLabel
                            checked={_.includes(selectedStudents, _id)}
                            onChange={(e) => onClickCheckbox("user", _id)}
                            control={<Checkbox />}
                            label={`${label} -  ${firstName} ${lastName}`}
                          />
                        </FormGroup>
                      );
                    })}
                  </>
                )}
              </Grid>
              <Grid item md={6}>
                {(!trainers || trainers.length === 0) && (
                  <>
                    <br />
                    <h1 style={{ textAlign: "center" }}>No Trainers Found</h1>
                  </>
                )}
                {trainers && trainers.length > 0 && (
                  <>
                    <h3>Selected Trainers - {selectedTrainers.length}</h3>
                    <br />
                    {trainers.map((t, i) => {
                      let { email, _id, firstName, lastName } = t;
                      let label = email;
                      return (
                        <FormGroup key={i}>
                          <FormControlLabel
                            checked={_.includes(selectedTrainers, _id)}
                            onChange={(e) => onClickCheckbox("trainer", _id)}
                            control={<Checkbox />}
                            label={`${label} -  ${firstName} ${lastName}`}
                          />
                        </FormGroup>
                      );
                    })}
                  </>
                )}
              </Grid>
              {/* submit button */}

              <LoadingButton
                type="submit"
                fullWidth
                loadingPosition="end"
                endIcon={<FaUsersViewfinder />}
                color="primary"
                loading={loading}
                loadingIndicator={"Adding..."}
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {!loading && mode === "edit"
                  ? "PROCEED & UPDATE"
                  : "PROCEED & ADD"}
              </LoadingButton>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </section>
  );
};

export default CreateEditBatch;
