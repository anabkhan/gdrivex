import { InsertDriveFile } from '@material-ui/icons';
import React, { useState } from 'react'
import '../../styles/FileItem.css'
import DownloadIcon from '@material-ui/icons/CloudDownload';
import DeleteIcon from '@material-ui/icons/Delete';
import { BASE_URL, DELETE_FILE, DOWNLOAD_FILE } from '../../constants/REST_URLS';
import { post, _delete } from '../../services/RestService';

import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { copyToClipboard } from '../../services/CommonUtil';
import Notification from '../Notifications/Notifications';

const options = [
    'Download',
    'Copy Link',
    'Delete'
];

const ITEM_HEIGHT = 48;

// const monthNames = 

const FileItem = ({ id, caption, size, onDeleted }) => {

    const [notification, setNotification] = useState({severity:'success', message: 'Default message', show: false});

    // const fileDate = 

    const getReadableFileSizeString = (fileSizeInBytes) => {
        let i = -1;
        const byteUnits = ['kB', 'MB', 'GB', 'TB']
        do {
            fileSizeInBytes = fileSizeInBytes / 1024;
            i++;
        } while (fileSizeInBytes > 1024);

        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
    }

    // const downloadFile = () => {
    //     $(document).on('click', '#download', function() {  
    //         window.open(`${BASE_URL}${DOWNLOAD_FILE}?name=${caption}`);    
    //     });
    // }

    const deleteFile = () => {
        post(`${DELETE_FILE}?name=${caption}`, { name: caption }).then((response) => {
            setNotification({
                severity: 'success',
                message: 'File Deleted',
                show: true
            })
            setTimeout(() => {
                onDeleted();
            }, 2000);
        }).catch((err) => {
            console.log('File deletion failed', err)
            setNotification({
                severity: 'error',
                message: 'File Deletion failed',
                show: true
            })
        })
    }

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (option) => {
        setAnchorEl(null);
        console.log('menu click', option)
        switch (option) {
            case 'Download':
                window.location = `${BASE_URL}${DOWNLOAD_FILE}/${caption}`;
                break;
            
            case 'Delete':
                deleteFile();
                break;

            case 'Copy Link':
                copyToClipboard(`${BASE_URL}${DOWNLOAD_FILE}/${caption}`)
                break;
        
            default:
                break;
        }
    };

    const onNotificationClose = () => {
        setNotification({severity:'success', message: 'Default message', show: false});
    }

    return (
        <div className='fileItem'>
            <a>
                <div className='fileItem--left'>
                    <InsertDriveFile />
                    <p>{caption}</p>
                </div>

                <div className='fileItem--right'>
                    {/* <p>{timestamp}</p> */}
                    <p>{getReadableFileSizeString(size)}</p>
                    <div>
                        <IconButton
                            aria-label="more"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            onClick={handleClick}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5,
                                    width: '20ch',
                                    color: 'black !important'
                                },
                            }}
                        >
                            {options.map((option) => (
                                <MenuItem key={option} onClick={() => handleClose(option)}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Menu>
                        {/* <a href={`${BASE_URL}${DOWNLOAD_FILE}/${caption}`} target='_blank' download style={{marginRight:'10px'}}>
                            <DownloadIcon style={{color:'rgb(51, 103, 214)'}}/>
                        </a>
                        <span onClick={deleteFile}>
                            <DeleteIcon style={{color:'red', cursor:'pointer'}}/>
                        </span> */}
                    </div>
                </div>
            </a>
            {notification.show && <Notification severity={notification.severity} message={notification.message} show={notification.show} onClose={onNotificationClose} />}
        </div>
    )
}

export default FileItem
