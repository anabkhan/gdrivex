import React, {useState, useEffect} from 'react'
import {db} from '../../firebase'
import FileItem from './FileItem'
import '../../styles/FilesView.css';
import { FileCard } from './FileCard';
import { get } from '../../services/RestService';
import { LIST_FILES } from '../../constants/REST_URLS';
import Notification from '../Notifications/Notifications';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';

export const FilesView = () => {
    const [files, setFiles] = useState([])
    const [notification, setNotification] = useState({severity:'success', message: 'Default message', show: false});

    const onNotificationClose = () => {
        setNotification({severity:'success', message: 'Default message', show: false});
    }

    const fetchFiles = () => {
        get(LIST_FILES).then((response) => {
            const keys = Object.keys(response.data);
            const files = [];
            keys.forEach(key => {
                const eachFile = response.data[key].file;
                files.push({
                    id: eachFile.name,
                    item: eachFile
                })
            });
            setFiles(files)
            console.log('files', files)
        }).catch((err) => {
            console.log(err);
            setNotification({
                severity: 'error',
                message: 'Fail to get file ' + err,
                show: true
            })
        })
    }

    useEffect(() => {
        fetchFiles();
    }, [])

    const [userSelectedFilter, setUserSelectedFilter] = React.useState('completed');

    const handleFileStatusFilterSelected = (e) => {
        setUserSelectedFilter(e.target.value);
    }

    return (
        <div className='filesView'>
            {/* <div className='filesView__row'>
                {
                    files.slice(0,5).map(({id,item})=>(
                        <FileCard name={item.caption} />
                    ))
                }
            </div> */}

            {/* <div className='filesView__titles'>
                <div className='filesView__titles--left'>
                    <p>Name</p>
                </div>

                <div className='filesView__titles--right'>
                    <p>File size</p>

                    <p>Action</p>
                </div>
            </div> */}

            <RadioGroup row aria-label="gender" name="row-radio-buttons-group" defaultValue="completed" onChange={handleFileStatusFilterSelected}>
                <FormControlLabel  value="completed" control={<Radio />} label="Completed" />
                <FormControlLabel value="progress" control={<Radio />} label="In Progress" />
            </RadioGroup>

            {
                files.map(({id, item}) => (
                    <>
                    { ((item.completed && userSelectedFilter === 'completed') || (!item.completed && userSelectedFilter === 'progress')) && <FileItem id={id} caption={item.name} size={item.size} timestamp={item.timestamp} onDeleted={fetchFiles} />}
                    </>
                ))
            }
            {notification.show && <Notification severity={notification.severity} message={notification.message} show={notification.show} onClose={onNotificationClose} />}
        </div>
    )
}
