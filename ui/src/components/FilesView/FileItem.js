import { InsertDriveFile } from '@material-ui/icons';
import React from 'react'
import '../../styles/FileItem.css'
import DownloadIcon from '@material-ui/icons/CloudDownload';
import DeleteIcon from '@material-ui/icons/Delete';
import { BASE_URL, DELETE_FILE, DOWNLOAD_FILE } from '../../constants/REST_URLS';
import { _delete } from '../../services/RestService';

// const monthNames = 

const FileItem = ({id, caption, timestamp, fileUrl, size}) => {

    // const fileDate = 

    const getReadableFileSizeString = (fileSizeInBytes) => {
        let i = -1;
        const byteUnits = ['kB', 'MB', 'GB', 'TB']
        do {
            fileSizeInBytes= fileSizeInBytes / 1024;
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
        _delete(`${DELETE_FILE}?name=${caption}`).then((response) => {
            alert('File deletion started')
        }).catch((err) => {
            console.log('File deletion failed', err)
            alert('File deletion faild')
        })
    }

    return (
        <div className='fileItem'>
            <a href={fileUrl} target='_blank' download>
                <div className='fileItem--left'>
                    <InsertDriveFile />
                    <p>{caption}</p>
                </div>

                <div className='fileItem--right'>
                    {/* <p>{timestamp}</p> */}
                    <p>{getReadableFileSizeString(size)}</p>
                    <div>
                        <a href={`${BASE_URL}${DOWNLOAD_FILE}?name=${caption}`} download={caption} style={{marginRight:'10px'}}>
                            <DownloadIcon style={{color:'rgb(51, 103, 214)'}}/>
                        </a>
                        <span onClick={deleteFile}>
                            <DeleteIcon style={{color:'red', cursor:'pointer'}}/>
                        </span>
                    </div>
                </div>
            </a>
        </div>
    )
}

export default FileItem
