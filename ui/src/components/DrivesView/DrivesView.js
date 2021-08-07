import React, {useState, useEffect} from 'react'
import DriveItem from './DriveItem'
import '../../styles/DrivesView.css'
import { Add } from '@material-ui/icons'
import { makeStyles, Modal } from '@material-ui/core'
import { get } from '../../services/RestService'
import { ADD_DRIVE, LIST_DRIVES, SUBMIT_AUTH } from '../../constants/REST_URLS'

function getModalStyle() {
    return {
        top: `50%`,
        left: `50%`,
        transform: `translate(-50%, -50%)`
    }
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3)
    }
}))

export const DrivesView = () => {

    const classes = useStyles();

    const [drives, setDrives] = useState([]);

    useEffect(() => {
        get(LIST_DRIVES).then((response) => {
            //const drives = response.drives;
            const keys = Object.keys(response.drives);
            const drives = [];
            keys.forEach(key => {
                const eachDrive = response.drives[key];
                drives.push({
                    email: eachDrive.user.emailAddress,
                    capacity: eachDrive.storageQuota.usageInDrive + "/" + eachDrive.storageQuota.totalInGB
                })
            });
            setDrives(drives)
        })
    }, [])

    const [modelStyle] = useState(getModalStyle);

    const [showAddDriveModal, setShowAddDriveModal] = useState(false)

    const [authCode, setAuthCode] = useState(null)

    const openAddDriveModal = () => {
        get(ADD_DRIVE).then((data) => {
            window.open(data.authUrl, "_blank")
        })
        setShowAddDriveModal(true);
    }

    const handleClose = () => {
        setShowAddDriveModal(false)
    }

    const submitAuthCode = () => {
        console.log('auth code : ', authCode)
        const authCodeUrl = `${SUBMIT_AUTH}?code=${authCode}`;
        get(authCodeUrl).then((data) => {
            console.log(data)
            handleClose()
        })
    }

    const handleTextChange = (e) => {
        setAuthCode(e.target.value)
    }

    return (
        <div className='drivesView'>
            <div className='drivesView--header'>
                <p style={{fontWeight:'500', fontSize:'x-large'}}>Drives</p>
                <span onClick={openAddDriveModal} style={{marginLeft:'50px', color:'rgb(51, 103, 214)', fontWeight:'bold', display:'flex', cursor:'pointer'}}>
                    <Add style={{color:'rgb(51, 103, 214)'}}/>
                    Add New Drive</span>
            </div>
            <DriveItem email={'akanabkhan@gmail.com'} capacity={15} status={'connected'} />

            <Modal
                open={showAddDriveModal}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={modelStyle} className={classes.paper}>
                    <p>Copy the code from the new tab and paste here</p>

                    <input type="text" value={authCode} onChange={handleTextChange} />
                    <button onClick={submitAuthCode}>Submit</button>

                </div>
            </Modal>

        </div>
    )
}
