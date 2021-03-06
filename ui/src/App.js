import { useState } from 'react';
import './App.css';
import { FilesView } from './components/FilesView/FilesView';
import Header from './components/header'
import SideBar from './components/sidebar/SideBar'
import GDriveLogo from "./media/google-drive-logo.svg";
import { auth, db, provider } from "./firebase";
import { DrivesView } from './components/DrivesView/DrivesView';

function App() {

  const [user, setUser] = useState()

  const [currentView, setCurrentView] = useState('FILES')

  const handleLogin=()=>{
    if (!user) {
      auth.signInWithPopup(provider).then((result)=>{
        window.sessionStorage.setItem("user", JSON.stringify(result.user));
        // Create DB if doesnt exist
        // db.collection(result.user.uid).onSnapshot(snapshot => {
        //   console.log('user snapshot', snapshot)
        // })
        setUser(result.user)
        console.log(result)
      })
    }
  }

  const handleOnItemSelected = (item) => {
    console.log('handleOnItemSelected', item)
    setCurrentView(item)
  }

  return (
    <div className="App">

      {
        !user ? (
        <>
            <Header />
            <div className='app__main'>
              <SideBar onItemSelected={handleOnItemSelected}/>
              { currentView === 'FILES' && <FilesView />}
            </div>
            <div>
            { currentView === 'DRIVES' && <DrivesView />}
            </div>
          </>
        ) : (
          <div className='app__login'>
            <img src={GDriveLogo} alt="GDriveX" />
            <button onClick={handleLogin}>Log in to GDriveX</button>
          </div>
        )
      }

    </div>
  );
}

export default App;
