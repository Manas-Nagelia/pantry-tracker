"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import { firestore } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [currItem, setCurrItem] = useState("");
  const [activeItem, setActiveItem] = useState("");
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(null);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);

    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  const searchByName = (value) => {
    const _filtered = inventory.filter(
      (item) => item.name.toUpperCase() === value.toUpperCase()
    );
    setFiltered(_filtered);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const updateItem = async () => {
    removeItem(activeItem);
    addItem(currItem);
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleUpdateOpen = () => setUpdateOpen(true);
  const handleUpdateClose = () => setUpdateOpen(false);

  // We'll add our component logic here
  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={updateOpen}
        onClose={handleUpdateClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Update name
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={currItem}
              onChange={(e) => setCurrItem(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                updateItem();
                setCurrItem("");
                setActiveItem("");
                handleUpdateClose();
              }}
            >
              Update
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Stack direction={"row"} spacing={2}>
        <TextField
          id="outlined-basic"
          label="Item"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => {
            searchByName(search);
          }}
        >
          Search
        </Button>
      </Stack>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Box border={"1px solid #333"}>
        <Box
          width="800px"
          height={filtered ? "150px" : "100px"}
          bgcolor={"#ADD8E6"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          style={filtered && { flexDirection: "column" }}
        >
          <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
            {filtered == null ? "Inventory Items" : "Filtered Inventory Items"}
          </Typography>
          {filtered && (
            <Button
              variant="contained"
              onClick={() => {
                setSearch("");
                setFiltered(null);
              }}
            >
              Clear Filter
            </Button>
          )}
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
          {filtered == null
            ? inventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="90%"
                  minHeight="150px"
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  bgcolor={"#f0f0f0"}
                  paddingX={5}
                >
                  <Typography
                    variant={"h3"}
                    color={"#333"}
                    textAlign={"center"}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography
                    variant={"h3"}
                    color={"#333"}
                    textAlign={"center"}
                  >
                    Quantity: {quantity}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setCurrItem(name);
                      setActiveItem(name);
                      handleUpdateOpen();
                    }}
                  >
                    Update Name
                  </Button>
                  <Button variant="contained" onClick={() => removeItem(name)}>
                    Remove
                  </Button>
                </Box>
              ))
            : filtered.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="90%"
                  minHeight="150px"
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  bgcolor={"#f0f0f0"}
                  paddingX={5}
                >
                  <Typography
                    variant={"h3"}
                    color={"#333"}
                    textAlign={"center"}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography
                    variant={"h3"}
                    color={"#333"}
                    textAlign={"center"}
                  >
                    Quantity: {quantity}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setCurrItem(name);
                      setActiveItem(name);
                      handleUpdateOpen();
                    }}
                  >
                    Update Name
                  </Button>
                  <Button variant="contained" onClick={() => removeItem(name)}>
                    Remove
                  </Button>
                </Box>
              ))}
        </Stack>
      </Box>
    </Box>
  );
}
