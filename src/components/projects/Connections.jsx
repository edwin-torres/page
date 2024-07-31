import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Grid, Paper, Typography, Button, CssBaseline, Dialog, DialogTitle, DialogContent, DialogActions, Box, Link, } from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';

const theme = createTheme({
  palette: {
    primary: {
      main: '#42a5f5', // Purple
    },
    secondary: {
      main: '#03dac6', // Teal
    },
    success: {
      main: '#4caf50', // Green
    },
    error: {
      main: '#f44336', // Red
    },
    background: {
      default: '#d7ccc8',
    },
    text: {
      primary: '#000000',
      secondary: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

const version1Items = [
  { id: 1, name: 'Apple', category: 'Fruits' },
  { id: 2, name: 'Orange', category: 'Fruits' },
  { id: 3, name: 'Banana', category: 'Fruits' },
  { id: 4, name: 'Grape', category: 'Fruits' },
  { id: 5, name: 'Dog', category: 'Animals' },
  { id: 6, name: 'Cat', category: 'Animals' },
  { id: 7, name: 'Bird', category: 'Animals' },
  { id: 8, name: 'Fish', category: 'Animals' },
  { id: 9, name: 'Red', category: 'Colors' },
  { id: 10, name: 'Blue', category: 'Colors' },
  { id: 11, name: 'Green', category: 'Colors' },
  { id: 12, name: 'Yellow', category: 'Colors' },
  { id: 13, name: 'Car', category: 'Modes of Transport' },
  { id: 14, name: 'Bike', category: 'Modes of Transport' },
  { id: 15, name: 'Bus', category: 'Modes of Transport' },
  { id: 16, name: 'Train', category: 'Modes of Transport' },
];

const version2Items = [
  { id: 1, name: 'Gryffindor', category: 'Hogwarts Houses' },
  { id: 2, name: 'Hufflepuff', category: 'Hogwarts Houses' },
  { id: 3, name: 'Ravenclaw', category: 'Hogwarts Houses' },
  { id: 4, name: 'Slytherin', category: 'Hogwarts Houses' },
  { id: 5, name: 'Harry Potter', category: 'Main Characters' },
  { id: 6, name: 'Hermione Granger', category: 'Main Characters' },
  { id: 7, name: 'Ron Weasley', category: 'Main Characters' },
  { id: 8, name: 'Albus Dumbledore', category: 'Main Characters' },
  { id: 9, name: 'Expelliarmus', category: 'Spells' },
  { id: 10, name: 'Wingardium Leviosa', category: 'Spells' },
  { id: 11, name: 'Expecto Patronum', category: 'Spells' },
  { id: 12, name: 'Lumos', category: 'Spells' },
  { id: 13, name: 'Hippogriff', category: 'Magical Creatures' },
  { id: 14, name: 'Thestral', category: 'Magical Creatures' },
  { id: 15, name: 'Basilisk', category: 'Magical Creatures' },
  { id: 16, name: 'House-elf', category: 'Magical Creatures' },
];

const version3Items = [
  { id: 1, name: 'Iron Man', category: 'Avengers' },
  { id: 2, name: 'Captain America', category: 'Avengers' },
  { id: 3, name: 'Thor', category: 'Avengers' },
  { id: 4, name: 'Black Widow', category: 'Avengers' },
  { id: 5, name: 'Star-Lord', category: 'Guardians of the Galaxy' },
  { id: 6, name: 'Gamora', category: 'Guardians of the Galaxy' },
  { id: 7, name: 'Drax', category: 'Guardians of the Galaxy' },
  { id: 8, name: 'Rocket Raccoon', category: 'Guardians of the Galaxy' },
  { id: 9, name: 'Thanos', category: 'Villains' },
  { id: 10, name: 'Loki', category: 'Villains' },
  { id: 11, name: 'Ultron', category: 'Villains' },
  { id: 12, name: 'Hela', category: 'Villains' },
  { id: 13, name: 'Mjolnir', category: 'Weapons and Artifacts' },
  { id: 14, name: 'Infinity Gauntlet', category: 'Weapons and Artifacts' },
  { id: 15, name: 'Tesseract', category: 'Weapons and Artifacts' },
  { id: 16, name: 'Arc Reactor', category: 'Weapons and Artifacts' },
];

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.primary,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.grey[300],
  },
}));

const shakeAnimation = {
  initial: { x: 0 },
  animate: { x: [0, -10, 10, -10, 10, 0] },
  transition: { duration: 0.4 },
};

const popUpAnimation = {
  initial: { scale: 1 },
  animate: { scale: 1.05 },
  transition: { duration: 0.2 },
};

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const categorizeItems = (items) => {
  const categories = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  return categories;
};

function ConnectionGrid() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [status, setStatus] = useState(null);
  const [itemsState, setItemsState] = useState([]);
  const [correctItems, setCorrectItems] = useState([]);
  const [showWinningMessage, setShowWinningMessage] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [version, setVersion] = useState('version1');
  const [isScreenWide, setIsScreenWide] = useState(window.innerWidth > 1000);

  useEffect(() => {
    resetGame(version);
  }, [version]);

  useEffect(() => {
    const handleResize = () => {
      setIsScreenWide(window.innerWidth > 1000);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const resetGame = (version) => {
    setSelectedItems([]);
    setStatus(null);
    setCorrectItems([]);
    setShowSolutions(false);
    if (version === 'version1') {
      setItemsState(shuffleArray([...version1Items]));
    } else if (version === 'version2') {
      setItemsState(shuffleArray([...version2Items]));
    } else {
      setItemsState(shuffleArray([...version3Items]));
    }
  };

  const handleItemClick = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems((prev) => prev.filter((i) => i !== item));
    } else if (selectedItems.length < 4 && !selectedItems.includes(item) && !correctItems.some(correct => correct.category === item.category)) {
      setSelectedItems((prev) => [...prev, item]);
    }
    setStatus(null);
  };

  const handleReset = () => {
    resetGame(version);
  };

  const handleSubmit = () => {
    if (selectedItems.length === 4) {
      const categories = selectedItems.map((item) => item.category);
      const allSameCategory = categories.every((cat) => cat === categories[0]);
      if (allSameCategory) {
        const updatedItemsState = itemsState.filter(
          (item) => !selectedItems.includes(item)
        );
        setCorrectItems((prev) => [...prev, { category: categories[0], items: selectedItems }]);
        setItemsState(updatedItemsState);
        setSelectedItems([]);
        if (updatedItemsState.length === 0) {
          setShowWinningMessage(true);
        }
      }
      setStatus(allSameCategory ? 'success' : 'error');
    }
  };

  const handleToggleSolutions = () => {
    setShowSolutions(prev => !prev);
  };

  const handleCloseWinningMessage = () => {
    setShowWinningMessage(false);
  };

  const allItems = version === 'version1' ? version1Items : version === 'version2' ? version2Items : version3Items;
  const categorizedItems = categorizeItems(allItems);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isScreenWide ? (
        <Container>
          <Typography variant="h3" gutterBottom sx={{textAlign:'center',  }}>Connections</Typography>
          
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', color: 'white', fontWeight:'normal' }}>
          This is an implementation of <Link href="https://en.wikipedia.org/wiki/The_New_York_Times_Connections" target="_blank" underline="hover">The New York Times Connections</Link>.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ textAlign: 'left', maxWidth:'555px' }}>
          In Connections, the goal is to divide a grid of sixteen words into four groups of four such that the words in each group belong to a specific category (e.g., "dog", "cat", "fish", and "parrot" for the category "Household Pets").

          </Typography>

          <Box display="flex" justifyContent="center" marginBottom={2}>
            <Button
              variant={version === 'version1' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setVersion('version1')}
              style={{ marginRight: '10px' }}
            >
              Version 1
            </Button>
            <Button
              variant={version === 'version2' ? 'contained' : 'outlined'}
              color="secondary"
              onClick={() => setVersion('version2')}
              style={{ marginRight: '10px' }}
            >
              Version 2
            </Button>
            <Button
              variant={version === 'version3' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setVersion('version3')}
            >
              Version 3
            </Button>
          </Box>
          <Grid container spacing={2}>
            {correctItems.map((correctItem, index) => (
              <Grid item xs={12} key={`correct-${index}`}>
                <motion.div layout>
                  <Item style={{ backgroundColor: theme.palette.success.main, padding: theme.spacing(4) }}>
                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }}>
                      {correctItem.category}
                    </Typography>
                    <Typography variant="body1">
                      {correctItem.items.map(item => item.name).join(', ')}
                    </Typography>
                  </Item>
                </motion.div>
              </Grid>
            ))}
            {itemsState.map((item) => (
              <Grid item xs={3} key={item.id}>
                <motion.div
                  layout
                  initial="initial"
                  animate={selectedItems.includes(item) ? "animate" : "initial"}
                  variants={popUpAnimation}
                  {...(status === 'error' && selectedItems.includes(item)
                    ? shakeAnimation
                    : {})}
                >
                  <Item
                    onClick={() => handleItemClick(item)}
                    style={{
                      backgroundColor: correctItems.some(correct => correct.items.includes(item))
                        ? theme.palette.success.main
                        : selectedItems.includes(item)
                        ? status === 'success'
                          ? theme.palette.success.main
                          : status === 'error'
                          ? theme.palette.error.main
                          : theme.palette.primary.light
                        : theme.palette.background.default,
                      cursor: correctItems.some(correct => correct.items.includes(item)) ? 'default' : 'pointer',
                    }}
                  >
                    {item.name}
                  </Item>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          <Box display="flex" justifyContent="center" marginTop={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              style={{ marginRight: '10px' }}
              disabled={selectedItems.length !== 4}
            >
              Check
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleReset}
              style={{ marginRight: '10px' }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleToggleSolutions}
            >
              {showSolutions ? 'Hide Solutions' : 'Reveal Solutions'}
            </Button>
          </Box>
          {showSolutions && (
            <Box marginTop={4}>
              <Typography variant="h6" gutterBottom>Solutions:</Typography>
              {Object.keys(categorizedItems).map((category, index) => (
                <Box key={`solution-${index}`} marginBottom={2}>
                  <Typography variant="h6">{category}</Typography>
                  <Typography variant="body1">{categorizedItems[category].map(item => item.name).join(', ')}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Container>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="h4" color="error">Please maximize your screen to view the content.</Typography>
        </Box>
      )}
      <Dialog
        open={showWinningMessage}
        onClose={handleCloseWinningMessage}
      >
        <DialogTitle>Congratulations!</DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            You have successfully completed all categories!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWinningMessage} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default ConnectionGrid;
