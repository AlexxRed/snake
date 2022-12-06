import { useEffect, useState } from 'react';
import './App.css';


const BOARD_SIZE = 10;
const CELLS = Array(BOARD_SIZE).fill(Array(BOARD_SIZE).fill(0));
const MOVES = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];
const SPEED = 500;

function App() {
  const [snakeDirection, setSnakeDirection] = useState(MOVES[0]);
  const [snake, setSnake] = useState([[1,1]]);
  const [food, setFood] = useState([0,0])

const handleKeyDown = (e) => {
  const index = MOVES.indexOf(e.key);
  if(index > -1){
    setSnakeDirection(MOVES[index])
  }
};

useEffect(() => {
  document.addEventListener('keydown', handleKeyDown)
});

useEffect(() => {
  const interval = gameRunning()
  return () => clearInterval()
}, [snake]);

const checkAvailableCell =  (position) => {
  switch(true){
    case position >= BOARD_SIZE:
      return 0
    case position < 0:
      return BOARD_SIZE - 1
    default: 
      return position
  }
};

const generateFood = () =>{
  let newFood
  do {
    newFood = [
      Math.floor(Math.random() * BOARD_SIZE),
      Math.floor(Math.random() * BOARD_SIZE),
    ]
  } while (snake.some(item => item[0] === newFood[0] && item[1] === newFood[1]))
  setFood(newFood);
}


const gameRunning = () => {
  const timerId = setTimeout( () => {
    const newSnake = snake
    let move = []

    switch (snakeDirection) {
      case MOVES[0]:
        move = [1,0]  
        break;
      case MOVES[1]:
        move = [-1,0]
        break;
      case MOVES[2]:
        move = [0,-1]
        break;
      case MOVES[3]:
        move = [0,1]
        break;

        default:
        break;
    }

    const snakeHead =  [
      checkAvailableCell(newSnake[newSnake.length - 1][0]+move[0]),
      checkAvailableCell(newSnake[newSnake.length - 1][1]+move[1]),
    ] 

    newSnake.push(snakeHead)

    let spliceIndex = 1

    if(snakeHead[0] === food[0] && snakeHead[1] === food[1]){
      spliceIndex = 0
      generateFood()
    }

    setSnake(newSnake.slice(spliceIndex))

  }, SPEED)
  return timerId
}

  return (
        <div>
          {CELLS.map((row, indexRow) => (
            <div key={indexRow} className='row'>
              {row.map((cell, indexCell)=> {
                let type = snake.some(elem =>
                  elem[0] === indexRow && elem[1] === indexCell
                  ) && 'snake'
                  if(type !== 'snake'){
                    type = (food[0] === indexRow && food[1] ===indexCell) && 'food'
                  }
                return(<div key={indexCell} className={`cell ${type}`}/>)
              })}
            </div>
          ))}
            <div className='cell'/>
            <div className='cell snake'/>
            <div className='cell food'/>
            <div className={`arrow up ${snakeDirection === 'ArrowUp'? 'selected': ''}`}/>
            <div className={`arrow down ${snakeDirection === 'ArrowDown'? 'selected': ''}`}/>
            <div className={`arrow left ${snakeDirection === 'ArrowLeft'? 'selected': ''}`}/>
            <div className={`arrow right ${snakeDirection === 'ArrowRight'? 'selected': ''}`}/>
        </div>
  );
}

export default App;
