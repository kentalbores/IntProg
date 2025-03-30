import React from 'react'
import { CircularProgress, Box, Typography } from '@mui/material'

const Loading = () => {
  return (
    <div>
      <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="50vh"
      bgcolor="rgba(84, 104, 108, 0.71)"
      position={"absolute"}
      width="30vw"
      borderRadius="10px"
      left={"33vw"}
      top={"22vh"}
      sx={{
        backdropFilter: 'blur(10px)',
        boxShadow: 24,
        padding: 3,
        color: 'white',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" mt={2} color='white'>
        Loading...
      </Typography>
    </Box>
    </div>
  )
}

export default Loading
