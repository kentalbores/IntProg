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
      bgcolor="rgba(46, 41, 41, 0.9)"
      position="absolute"
      width="30vw"
    >
      <CircularProgress size={60} />
      <Typography variant="h6" mt={2} color="white">
        Loading...
      </Typography>
    </Box>
    </div>
  )
}

export default Loading
