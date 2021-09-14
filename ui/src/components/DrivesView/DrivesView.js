import React, {useState, useEffect} from 'react'
import DriveItem from './DriveItem'
import '../../styles/DrivesView.css'
import { Add } from '@material-ui/icons'
import { makeStyles, Modal } from '@material-ui/core'
import { get } from '../../services/RestService'
import { ADD_DRIVE, LIST_DRIVES, REFRESH_DRIVE, SUBMIT_AUTH } from '../../constants/REST_URLS'
import { getReadableFileSizeString } from '../../services/FileService'
import CachedIcon from '@material-ui/icons/Cached';

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

    const [usedSizeTotal, setUsedSizeTotal] = useState(0);

    const [availableSizeTotal, setAvailableSizeTotal] = useState(0);

    useEffect(() => {
        getDrives();
    }, [])

    const getDrives = () => {
        get(LIST_DRIVES).then((response) => {
            //const drives = response.drives;
            const keys = Object.keys(response.drives);
            const drives = [];
            let usedSizeCounter = 0;
            let availableSizeCounter = 0;
            keys.forEach(key => {
                const eachDrive = response.drives[key];
                drives.push({
                    email: eachDrive.user.emailAddress,
                    capacity: eachDrive.storageQuota.usageInGB + "/" + eachDrive.storageQuota.totalInGB,
                    usedPercentage: ((parseInt(eachDrive.storageQuota.usage, 10) / parseInt(eachDrive.storageQuota.limit, 10)) * 100)
                })

                usedSizeCounter = usedSizeCounter + parseInt(eachDrive.storageQuota.usage);
                availableSizeCounter = availableSizeCounter + parseInt(eachDrive.storageQuota.limit);
            });
            setUsedSizeTotal(usedSizeCounter);
            setAvailableSizeTotal(availableSizeCounter);
            setDrives(drives)
            console.log('drives', drives)
        })
    }

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

    const refreshDrive = () => {
        get(REFRESH_DRIVE).then((res) => {
            getDrives();
        })
    }

    return (
        <div className='drivesView'>
            <div className='drivesView--header'>
                <p style={{fontWeight:'500', fontSize:'x-large'}}>Drives ({getReadableFileSizeString(usedSizeTotal) + '/' + getReadableFileSizeString(availableSizeTotal)}
                , Avl - <text class='green__text'>{getReadableFileSizeString(availableSizeTotal - usedSizeTotal)}</text>)
                <span onClick={refreshDrive} class="drivesView--header--refresh--drives"><CachedIcon /></span></p>
                <span onClick={openAddDriveModal} style={{marginLeft:'50px', color:'rgb(51, 103, 214)', fontWeight:'bold', display:'flex', cursor:'pointer'}}>
                    <Add style={{color:'rgb(51, 103, 214)'}}/>
                    Add</span>
            </div>

            {

                drives.map(({email, capacity, usedPercentage}) => (
                    <DriveItem key={email} email={email} capacity={capacity} usedPercentage={usedPercentage} status={'connected'} />
                ))
            }

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
