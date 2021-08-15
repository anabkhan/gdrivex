import React, {useState, useEffect} from 'react'
import AddICon from '@material-ui/icons/Add'
import './../../styles/NewFile.css'

import firebase from 'firebase'
import { storage, db } from "../../firebase";
import { makeStyles, Modal } from '@material-ui/core';
import { get, post } from '../../services/RestService';
import { BASE_URL, UPLOAD_FILE, UPLOAD_STATUS } from '../../constants/REST_URLS';
import { uploadFile } from '../../services/FileService';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { Uploads } from '../Uploads';

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
        // border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3)
    }
}))

export const NewFile = () => {

    const [uploadStatus, setUploadStatus] = useState([])

    useEffect(() => {
        get(UPLOAD_STATUS).then((response) => {
            const keys = Object.keys(response.data);
            const statuses = [];
            keys.forEach(key => {
                const status = response.data[key];
                statuses.push({
                    id: key,
                    item: status
                })
            });
            setUploadStatus(statuses)
            console.log('files', statuses)
        }).catch((err) => {
            console.log(err);
            alert(err);
        })
    }, [])

    const classes = useStyles();

    const [modelStyle] = useState(getModalStyle);
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);

    const [uploading, setUploading] = useState(false)

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0])
            console.log('file', e.target.files[0])
        }
    }

    const handleUpload = () => {
        setUploading(true);

        uploadFile(file)

        // const data = new FormData();
        // data.append('file', file)

        // return fetch(BASE_URL + UPLOAD_FILE, {
        //     method: 'post',
        //     body: data
        // }).then((response) => response.json()).then(response => {
        //     console.log(response)
        // }).catch(error => {
        //     console.log(error)
        // })

        /*storage.ref(`files/${file.name}`).put(file).then(snapshot => {
            console.log(snapshot)

            storage.ref('files').child(file.name).getDownloadURL().then(url => {
                db.collection('myFiles').add({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    caption: file.name,
                    fileUrl: url,
                    size: snapshot._delegate.bytesTransferred
                })
            })
        })*/
    }

    return (
        <div className='newFile'>
            <div className='newFile__container' onClick={handleOpen}>
                <CloudUploadIcon  style={{color:'green'}}/>
                <p>Uploads</p>
            </div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={modelStyle} className={classes.paper}>

                    <Uploads open={open}/>

                   {/* <div className="newUploadTask">
                    <input type="text" placeholder="  Enter url or magnet" className="newUploadTask__input" onChange={handleChange}/>
                    <span className="newUploadTask__submit">
                        <CloudUploadIcon  style={{color:'green'}}/>
                        <text style={{marginLeft:'5px'}}>Upload</text>
                    </span>
                   </div> */}

                   {/* Show upload tasks */}



                    {/* <p>Select file you want to upload!</p>

                    {
                        uploading ? (
                            <p>Uploading</p>
                        ) : (
                            <>
                            <input type="file" onChange={handleChange} />
                            <button onClick={handleUpload}>Upload</button>
                            </>
                        )
                    } */}

                </div>
            </Modal>

        </div>
    )
}
