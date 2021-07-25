import { useState } from 'react';
import './App.css';
import { FilesView } from './components/FilesView/FilesView';
import Header from './components/header'
import SideBar from './components/sidebar/index'
import GDriveLogo from "./media/google-drive-logo.svg";
import { auth, db, provider } from "./firebase";

function App() {

  const [user, setUser] = useState()

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

  return (
    <div className="App">

      {
        user ? (
        <>
            <Header />
            <div className='app__main'>
              <SideBar />
              <FilesView />
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
