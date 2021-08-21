import React, {useState, useEffect} from 'react';
import { CREATE_UPLOAD_TASK, UPLOAD_STATUS } from '../../constants/REST_URLS';
import { get, post } from '../../services/RestService';
import './uploads.css';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { getReadableFileSizeString } from '../../services/FileService';

export const Uploads = (open) => {

    const [uploadStatus, setUploadStatus] = useState([]);
    const [newTaskUrl, setNewTaskUrl] = useState(null);

    const fetchUpdateTasks = () => {
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
            window.removeEventListener('mousemove', () => {})
        }
        
    }, []);

    const handleChange = (e) => {
        setNewTaskUrl(e.target.value)
    }

    const handleUploadSubmit = () => {
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

    return (
        <div className="uploads">
            <div className="newUploadTask">
                <input type="text" placeholder="  Enter url or magnet" className="newUploadTask__input" onChange={handleChange} />
                <span className="newUploadTask__submit" onClick={handleUploadSubmit}>
                    <CloudUploadIcon style={{ color: 'green' }} />
                    <text style={{ marginLeft: '5px' }}>Upload</text>
                </span>
            </div>

            {/* Running upload task */} 
            <div className="upload__tasks">
                {
                    uploadStatus.map(({id, item}) => (
                        <div className="uploads__single__task" style={{background:`linear-gradient(to right, rgb(118 232 169 / 98%) ${((item.downloaded / item.total) * 100)}%, white 0%)`}}>
                            <span className="uploads__task__name">{id}</span>
                            <span className="uploads__task__progress">{getReadableFileSizeString(item.downloaded)}/{getReadableFileSizeString(item.total)}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}