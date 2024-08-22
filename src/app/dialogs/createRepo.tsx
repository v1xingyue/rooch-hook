import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DialogTransition, toastOptions } from "../config";
import AddIcon from "@mui/icons-material/Add";
import {
  useCurrentSession,
  UseSignAndExecuteTransaction,
} from "@roochnetwork/rooch-sdk-kit";
import { Args, Transaction } from "@roochnetwork/rooch-sdk";
import { toast } from "react-toastify";

export const CreateRepoDialog = () => {
  const [repoUrl, setRepoUrl] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const session = useCurrentSession();
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;
  const { mutateAsync: signAndExecuteTransaction } =
    UseSignAndExecuteTransaction();

  const handleCreateRepo = async () => {
    if (session) {
      console.log(session);
      if (!repoUrl) {
        toast.error("Please enter the repository URL", toastOptions);
        return;
      }

      let repoUrlTmp = repoUrl;

      // remove .git
      if (repoUrlTmp.endsWith(".git")) {
        repoUrlTmp = repoUrlTmp.slice(0, -4);
      }

      let parts = repoUrlTmp.split("/");
      let repoName = parts[parts.length - 1];
      console.log(mypackage, repoName, repoUrlTmp);

      const txn = new Transaction();
      txn.callFunction({
        function: "create_repo",
        module: "developer",
        address: mypackage as string,
        args: [Args.string(repoUrlTmp), Args.string(repoName)],
      });

      try {
        await signAndExecuteTransaction({ transaction: txn });
        toast.success("Transaction sent", toastOptions);
      } catch (error) {
        toast.error("Transaction failed" + error, toastOptions);
      } finally {
        setOpen(false);
      }
    } else {
      // mui pop up error tips
      toast.error("Please init session first", toastOptions);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        <AddIcon color="primary" />
      </Button>

      <Dialog
        open={open}
        TransitionComponent={DialogTransition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Bind One Repository On Rooch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the repository URL you want to bind : Example:{" "}
            <b>https://github.com/username/repository</b>
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            name="email"
            label="Repository URL"
            fullWidth
            variant="standard"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={async () => {
              await handleCreateRepo();
            }}
          >
            Bind Repository
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
