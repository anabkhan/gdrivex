import React, {useState, useEffect} from 'react';
import { CANCEL_UPLOAD_TASK, CREATE_MAGNET_UPLOAD_TASK, CREATE_UPLOAD_TASK, FILES_FROM_MAGNET, UPLOAD_STATUS } from '../../constants/REST_URLS';
import { get, post } from '../../services/RestService';
import './uploads.css';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloseIcon from '@material-ui/icons/Close';
import PublishIcon from '@material-ui/icons/Publish';
import { getReadableFileSizeString } from '../../services/FileService';
import { Checkbox } from '@material-ui/core';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CancelIcon from '@material-ui/icons/Cancel';
import Notification from '../Notifications/Notifications';

export const Uploads = (open) => {

    const [uploadStatus, setUploadStatus] = useState([]);
    const [newTaskUrl, setNewTaskUrl] = useState(null);

    const [torrentFiles, setTorrentFiles] = useState([]);
    const [torrentMagnet, setTorrentMagnet] = useState(null);

    const [selectedTorrentFiles, setSelectedTorrentFiles] = useState([]);

    const [notification, setNotification] = useState({severity:'success', message: 'Default message', show: false});

    const onNotificationClose = () => {
        setNotification({severity:'success', message: 'Default message', show: false});
    }

    const fetchUpdateTasks = () => {
        get(UPLOAD_STATUS).then((response) => {
            const keys = Object.keys(response.data);
            const statuses = [];
            keys.forEach(key => {
                const status = response.data[key];
                status.downloaded = status.downloaded.reduce((a, b) => a + b, 0)
                statuses.push({
                    id: key,
                    item: status
                })
            });
            setUploadStatus(statuses)
            console.log('files', statuses)
        }).catch((err) => {
            console.log(err);
            // alert(err);
        })
    }

    useEffect(() => {
        
        fetchUpdateTasks();

        var task = setInterval(() => {
            fetchUpdateTasks();
        }, 1000);

        window.addEventListener('mousemove', () => {});

        // returned function will be called on component unmount 
        return () => {
            clearInterval(task)
            setSelectedTorrentFiles([])
            setTorrentMagnet(null)
            window.removeEventListener('mousemove', () => {})
        }
        
    }, []);

    const handleChange = (e) => {
        setNewTaskUrl(e.target.value)
    }

    const onTorrentFileSelected = (file) => {
        if (file.selected) {
            selectedTorrentFiles.push(file)
        } else {
            let index = 0;
            selectedTorrentFiles.forEach(selectedFile => {
                if (selectedFile.id === file.id) {
                    selectedTorrentFiles.splice(index, 1);
                }
                index++;
            })
        }
        setSelectedTorrentFiles(selectedTorrentFiles);
        console.log(selectedTorrentFiles);
    }

    const clearFilesSelection = () => {
        setSelectedTorrentFiles([])
        setTorrentFiles([])
    }

    const createTaskForSelectedFiles = () => {
        post(CREATE_MAGNET_UPLOAD_TASK, {
            files:selectedTorrentFiles,
            magnet: torrentMagnet
        }).then((res) => {
            if (res.status && res.status === 'Fail') {
                console.log('Failure to start upload',res);
                // alert('Failure to start upload \n' + res.message);
                setNotification({
                    severity: 'error',
                    message: 'Failure to start upload ' + res,
                    show: true
                })
            } else {
                console.log('Upload started',res);
                // alert('Upload started');
                setNotification({
                    severity: 'success',
                    message: 'Upload Started!',
                    show: true
                })
            }
        }).catch((err) => {
            console.log('Failure to start upload',err);
            // alert('Failure to start upload');
            setNotification({
                severity: 'error',
                message: 'Failure to start upload ' + err,
                show: true
            })
        })
    }

    const handleUploadSubmit = () => {
        if (newTaskUrl && newTaskUrl.startsWith('magnet')) {
            // Get list of files to show to user
            // User selects which file to download
            setSelectedTorrentFiles([])
            setTorrentMagnet(null)
            get(`${FILES_FROM_MAGNET}?magnet=${newTaskUrl}`).then((res) => {
                // const keys = Object.keys(res.data.files);
                const files = [];
                for (let index = 0; index < res.data.files.length; index++) {
                    const file = res.data.files[index];
                    files.push({
                        ...file,id:index
                    });
                }
                setTorrentFiles(files)
                setTorrentMagnet(res.data.torrentId)
            }).catch((err) => {
                console.log('Error while fetching files from magnet',err)
                alert('Error while getting info about magnet. Try another magnet')
            })


        } else {
            post(CREATE_UPLOAD_TASK, {
                url: newTaskUrl
            }).then((res) => {
                console.log('Upload started',res);
                alert('Upload started');
            }).catch((err) => {
                console.log('Failure to start upload',err);
                alert('Failure to start upload');
            })
        }
    }

    const cancelUploadTask = (id) => {
        get(CANCEL_UPLOAD_TASK + '?id=' + id).then(res => {
            console.log(res);
        })
    }

    return (
        <div className="uploads">
            <div className="newUploadTask">
                <input type="text" placeholder="  Enter url or magnet" className="newUploadTask__input" value={newTaskUrl} onChange={handleChange} />
                <span className="newUploadTask__submit button-green" onClick={handleUploadSubmit}>
                    <CloudUploadIcon style={{ color: 'green' }} />
                    <text style={{ marginLeft: '5px' }}>Upload</text>
                </span>
            </div>

            {
                torrentFiles.length > 0 &&
                <div>
                    <p>Select files to download</p>
                    <div className="upload__tasks torrent_file_selection">
                        {
                            torrentFiles.map(({ id, name, size, offset }) => (
                                <div className="uploads__single__task">
                                    <Checkbox
                                        color="primary"
                                        onChange={(event) => {onTorrentFileSelected({ id, name, size, offset, selected:event.target.checked })}}
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                    <span className="uploads__task__name">{name}</span>
                                    <span>{getReadableFileSizeString(size)}</span>
                                </div>
                            ))
                        }
                    </div>
                    <div className="torrent_file_selection_actions">
                        <span className="action" onClick={clearFilesSelection}>
                            <CloseIcon style={{color:'red'}}/>
                        </span>
                        <span className="action" onClick={createTaskForSelectedFiles}>
                            <PublishIcon style={{color:'green'}}/>
                        </span>
                    </div>
                </div>
            }

            {/* Running upload task */} 
            <div className="upload__tasks">
                {
                    uploadStatus.map(({id, item}) => (
                        <div className="uploads__single__task" style={{background:`linear-gradient(to right, rgb(118 232 169 / 54%) ${((item.downloaded / item.total) * 100)}%, #202124 0%)`}}>
                            <span className="uploads__task__name">{id}</span>
                            {
                                item.failed && <span>{item.failReason}
                                    <ErrorOutlineIcon style={{color:'red'}}/>
                                </span>
                            }
                            {!item.failed && <span className="uploads__task__progress">{getReadableFileSizeString(item.downloaded)}/{getReadableFileSizeString(item.total)}</span>}
                            <span onClick={() => {cancelUploadTask(id)}}><CancelIcon style={{color:'red', cursor:'pointer'}} /></span>
                        </div>
                    ))
                }
            </div>

            {notification.show && <Notification severity={notification.severity} message={notification.message} show={notification.show} onClose={onNotificationClose} />}
        </div>
    )
}