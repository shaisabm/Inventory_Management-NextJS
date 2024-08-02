'use client'
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography} from "@mui/material";
import { collection, query, getDocs, doc, deleteDoc, setDoc, getDoc} from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'),item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const {quanitiy} = docSnap.data()
      await setDoc(docRef, {quanitiy: quanitiy+1})

    } else {
      setDoc(docRef, {quanitiy: 1})
    }

    await updateInventory()

  }


  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'),item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const {quanitiy} = docSnap.data()
      if (quanitiy === 1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quanitiy: quanitiy-1})
      }
    }
    await updateInventory()

  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box 
    width='100vw' 
    height='100vh' 
    display='flex' 
    flexDirection='column'
    justifyContent='center' 
    alignItems='center'
    gap={2}>

      <Modal open = {open} onClose = {handleClose}>
        <Box 
        position='absolute' 
        top='50%' 
        left='50%' 
        width={400} 
        bgcolor='white' 
        border ='2px solid #000'
        boxShadow={24}
        p={4}
        display='flex'
        flexDirection='column'
        gap={3}
        sx={{
          transform: 'translate(-50%, -50%)',
        }}>
          <Typography variant='h6'>Add Item</Typography>
          <Stack width='100%' direction='row' spacing={2}>
            <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value)
            }}/>
            <Button variant='outlined' onClick={()=>{
              addItem(itemName)
              setItemName('')
              handleClose()
            }}>Add</Button>
          </Stack>
        </Box>
      </Modal>
        <Button variant='contained' onClick={handleOpen}>
          Add Item
        </Button>
        
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '800px', marginBottom: '10px' }}
        />
        
        <Box border='1px solid #333'>
          <Box
          width="800px"
          height="100px"
          display='flex'
          bgcolor="#ADD8E6"
          alignItems='center' 
          justifyContent='center'>
            <Typography variant="h2" color='#333'>
              Inventory Items
            </Typography>
          </Box>
        
        <Stack width='800px' height='300px' spacing={2} overflow='auto'>
          {
            filteredInventory.map(({name, quanitiy})=> (
              <Box 
                key={name} 
                width='100%'
                minHeight='150px'
                display='flex'
                alignItems='center'
                justifyContent='space-between'
                bgcolor='#f0f0f0'
                padding={5}>
                  <Typography 
                  variant="h3" 
                  color='#333' 
                  textAlign='center'
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>

                  <Typography 
                  variant="h3" 
                  color='#333' 
                  textAlign='center'
                  >
                    {quanitiy}
                  </Typography>
                  <Stack direction='row' spacing={2}>
                  <Button variant='contained' onClick={()=>{
                    addItem(name)
                  }}>
                    Add
                  </Button>

                  <Button variant='contained' onClick={()=>{
                    removeItem(name)
                  }}>
                    Remove
                  </Button>
                  </Stack>
                </Box>
            ))}
        </Stack>
        </Box>
    </Box>
  )
}