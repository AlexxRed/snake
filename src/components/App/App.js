import { useEffect, useState } from 'react';
import './App.css';
import axios from "axios";

axios.defaults.baseURL = "https://snake-backend.onrender.com/api/top";


function App() {

  const [boardSize, setBoardSize] = useState(10);

  const CELLS = Array(boardSize).fill(Array(boardSize).fill(0));
  const FOOD_VALUES = [1, 5, 10];
  const MOVES = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];

  const [speed, setSpeed] = useState(600);
  const [snakeDirection, setSnakeDirection] = useState(MOVES[0]);
  const [snake, setSnake] = useState([[1,1]]);
  const [food, setFood] = useState([0,0]);
  const [pause, setPause] = useState(false);
  const [score, setScore] = useState(0);
  const [foodValue, setFoodValue] = useState(1);
  const [lose, setLose] = useState(false);
  const [tablePlayers, setTablePlayers] = useState(null);
  const [playerName, setPlayerName] = useState('')

  

  useEffect(() => {
    try {
      async function getPlayers (){
        const {data} = await axios.get("/");
        const top = data.sort(
          (first, second) => second.totalScore - first.totalScore)
        setTablePlayers(top)
      }
      getPlayers()
    } catch (error) {
      console.log(error.massege)
    }
    
  }, [lose])
  

const handleKeyDown = (e) => {
  const index = MOVES.indexOf(e.key);
  if(index > -1){
    setSnakeDirection(MOVES[index])
  }
  if(e.key === ' '){
    // handlePause()
  }
};


useEffect(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keypress', (e)=> {if(e.key=== ' '){handlePause()}})
});

useEffect(() => {
  gameRunning()
  // const interval = gameRunning()
  return () => clearInterval()
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [snake, pause]);

function checkAvailableCell(position){
  switch(true){
    case position >= boardSize:
      return 0
    case position < 0:
      return boardSize - 1
    default: 
      return position
  }
};

function generateFood(){
  let newFood
  do {
    newFood = [
      Math.floor(Math.random() * boardSize),
      Math.floor(Math.random() * boardSize),
    ]
    const rand = Math.floor(Math.random() * FOOD_VALUES.length);
    setFoodValue(FOOD_VALUES[rand]);

  // eslint-disable-next-line no-loop-func
  } while (snake.some(item => item[0] === newFood[0] && item[1] === newFood[1]))
  setFood(newFood);
};


function gameRunning(){

  const timerId = setTimeout(() => {
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
    };

    const snakeHead =  [
      checkAvailableCell(newSnake[newSnake.length - 1][0]+move[0]),
      checkAvailableCell(newSnake[newSnake.length - 1][1]+move[1]),
    ] 

    newSnake.push(snakeHead)

    let spliceIndex = 1
    const snakeCopy = newSnake.slice(0)
    const head = snakeCopy.shift()

    if(snakeCopy.some(item => item[0] === head[0]&& item[1]===head[1])){
      setLose(true)
      setSpeed(10000000)
      sendPlayerResult(playerName, score)
      console.log('gameover')
    }

    if(snakeHead[0] === food[0] && snakeHead[1] === food[1]){
      spliceIndex = 0
      setScore(score + foodValue);
      if(score >=50 ){
        setSpeed(500)
      }
      if(score >=100 ){
        setSpeed(400)
      }
      if(score >=150 ){
        setSpeed(300)
      }
      if(score >=200 ){
        setSpeed(200)
      }
      if(score >=250 ){
        setSpeed(100)
      }
      generateFood();
    }

    setSnake(newSnake.slice(spliceIndex))

  }, speed)
  return timerId
};

function handleSubmit(e){
  e.preventDefault()
  const form = e.currentTarget;
  const name = form.elements.name.value;
  const boardSize = Number(form.elements.boardSize.value);
  setBoardSize(boardSize)
  setPlayerName(name)
  console.log(name, boardSize)
  form.reset()
};

function handlePause(){
  if(pause===true){
    setSpeed(10000000)
  }if(pause===false)
    setSpeed(600)
  setPause(!pause)
};

function startNewGame(){
  setSnake([[1,1]])
  setLose(false)
  setSpeed(600)
  setFoodValue(1)
  setPause(false)
};

async function sendPlayerResult (name, score){
  const totalScore = score
  try {
    const result = await axios.post("/", {name, totalScore});
    console.log(result)
  } catch (error) {
    console.log(error)
  }
  
}

  return (
        <div className='container'>

          <div className='left-side'>
        <div className='top-container'>
        {lose && 
        <>
          <h3><span className='score-counter'>Game over</span></h3>
          <button className='button-submit' onClick={startNewGame}>Start new game</button>
        </>
        }
        {!lose && <h3 className='game-running'>Game is running</h3>}
        <h3>Your Score:<span className='score-counter'>{score}</span></h3>
        </div>
          {CELLS.map((row, indexRow) => (
            <div key={indexRow} className='row'>
              {row.map((cell, indexCell)=> {
                let type = snake.some(elem =>
                  elem[0] === indexRow && elem[1] === indexCell
                  ) && 'snake'
                  if(type !== 'snake'){
                    type = (food[0] === indexRow && food[1] ===indexCell) && 
                    `${foodValue === 1 ? 'food': foodValue === 5 ? 'five': 'ten'}` 
                  }
                return(<div key={indexCell} className={`cell ${type}`}/>)
              })}
            </div>
          ))}
          <div className='controller-container'>
            <div className={`arrow up ${snakeDirection === 'ArrowUp'? 'selected': ''}`}/>
            <div className='controller-container-bottom'>
              <div className={`arrow left ${snakeDirection === 'ArrowLeft'? 'selected': ''}`}/>
              <div className={`arrow down ${snakeDirection === 'ArrowDown'? 'selected': ''}`}/>
              <div className={`arrow right ${snakeDirection === 'ArrowRight'? 'selected': ''}`}/>
            </div>
            <div className={`pause ${pause === true ? 'selected': ''}`} onClick={handlePause}/>
          </div>
          </div>
          <div className='right-side'>
            <form className='player-form' onSubmit={handleSubmit}>
            <label className='label-player' id='name'>
              <h3>Your name</h3>
              <input className='input-player' name='name' type={'text'} min='3' max='30' required/>
            </label>
            <label id='boardSize'>
              <h3>Choose field size</h3>  
              <input className='input-player' name='boardSize' type={"number"} min='10' max='15' required/>
            </label>
            
            <button className='button-submit' type='submit'>Play</button>
            </form>
            <h3 className='list-players'>Top Players</h3>
              <div className='top-player-container'>
                {tablePlayers && tablePlayers.map(
                  item => <div className='top-player-item' key={item._id}>
                    <div className='player-string'>{item.name}</div>
                    <div className='player-string'>{item.totalScore}</div>
                    </div>)}
              </div>
          </div>
        </div>
  );
}

export default App;
